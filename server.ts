import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json({ limit: "20mb" }));

// Lazy initializer for GoogleGenAI to prevent crashing if API key is not present during start
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please configure it in your AI Studio secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to handle chat requests
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, assistantId, systemInstruction, preferredModel, image, temperature } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    const ai = getAiClient();
    const model = preferredModel || "gemini-3.5-flash";

    // Format historical messages into Gemini format
    // Gemini roles must be 'user' or 'model'
    const formattedContents: any[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        const parts: any[] = [];
        
        // Handle images in history if they exist
        if (msg.image) {
          const imgMatch = msg.image.match(/^data:([^;]+);base64,(.+)$/);
          if (imgMatch) {
            parts.push({
              inlineData: {
                mimeType: imgMatch[1],
                data: imgMatch[2],
              },
            });
          }
        }
        
        parts.push({ text: msg.content });
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts,
        });
      });
    }

    // Append the active current message
    const currentParts: any[] = [];
    if (image) {
      const imgMatch = image.match(/^data:([^;]+);base64,(.+)$/);
      if (imgMatch) {
        currentParts.push({
          inlineData: {
            mimeType: imgMatch[1],
            data: imgMatch[2],
          },
        });
      }
    }
    currentParts.push({ text: message || "Analyze this attached image." });

    formattedContents.push({
      role: "user",
      parts: currentParts,
    });

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: model,
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant.",
        temperature: temperature !== undefined ? Number(temperature) : 0.7,
      },
    });

    const aiText = response.text || "I was unable to generate a text response.";

    return res.json({
      role: "model",
      content: aiText,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during message generation.",
    });
  }
});

// API endpoint to enhance a brief user prompt
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt is required" });
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert Prompt Engineer. Your task is to polish, refine, and expand the user's brief input query into an engaging, clear, and rich prompt for an AI. 
Keep the user's core intent but add details, structural requests, or output constraints to make the result extremely effective. 
Respond ONLY with the final expanded prompt. Do not write any preamble, intro, or explanation.`,
        temperature: 0.8,
      },
    });

    const enhancedPrompt = response.text?.trim() || prompt;

    return res.json({ enhanced: enhancedPrompt });

  } catch (error: any) {
    console.error("Gemini API Error in /api/enhance-prompt:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while enhancing the prompt.",
    });
  }
});

// Setup Vite Dev Server / Static Asset Hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();
