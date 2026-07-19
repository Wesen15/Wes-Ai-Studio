import { X, Settings, User, Bot, Sliders, Heart, Wifi } from "lucide-react";
import { UserSettings, ModelType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import LocalLlmHub from "./LocalLlmHub";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md max-h-[82vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
          id="settings-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <Settings className="w-5 h-5 text-[#FF4D4D] animate-spin-slow" />
              <h2 className="text-base font-extrabold tracking-tight font-display text-slate-900">Preferences</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 transition-colors rounded-lg hover:text-slate-600 hover:bg-slate-50"
              id="close-settings-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* User Profile */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                <User className="w-4 h-4 text-[#FF4D4D]" />
                Your Name
              </label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => onSaveSettings({ ...settings, userName: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF4D4D] focus:ring-1 focus:ring-[#FF4D4D]/20 transition-all text-sm font-medium"
                id="user-name-input"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                <Bot className="w-4 h-4 text-[#FF4D4D]" />
                Preferred Model
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => onSaveSettings({ ...settings, preferredModel: "gemini-3.5-flash" })}
                  className={`flex flex-col items-start p-3 text-left transition-all border rounded-2xl ${
                    settings.preferredModel === "gemini-3.5-flash"
                      ? "border-[#FF4D4D] bg-red-50/40 text-slate-900"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                  id="model-flash-btn"
                >
                  <span className={`text-xs font-extrabold ${settings.preferredModel === "gemini-3.5-flash" ? "text-[#FF4D4D]" : "text-slate-700"}`}>
                    Gemini 3.5 Flash
                  </span>
                  <span className="text-[11px] opacity-85 mt-1 leading-normal font-medium">High-speed, multimodal, ideal for everyday interactive chatting.</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onSaveSettings({ ...settings, preferredModel: "gemini-3.1-pro-preview" })}
                  className={`flex flex-col items-start p-3 text-left transition-all border rounded-2xl ${
                    settings.preferredModel === "gemini-3.1-pro-preview"
                      ? "border-emerald-500 bg-emerald-50/10 text-slate-900"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                  id="model-pro-btn"
                >
                  <span className={`text-xs font-extrabold ${settings.preferredModel === "gemini-3.1-pro-preview" ? "text-emerald-600" : "text-slate-700"}`}>
                    Gemini 3.1 Pro Preview
                  </span>
                  <span className="text-[11px] opacity-85 mt-1 leading-normal font-medium">Advanced reasoning, coding, and context-heavy diagnostic tasks.</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSaveSettings({ ...settings, preferredModel: "local" })}
                  className={`flex flex-col items-start p-3 text-left transition-all border rounded-2xl ${
                    settings.preferredModel === "local"
                      ? "border-amber-500 bg-amber-50/10 text-slate-900"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                  id="model-local-btn"
                >
                  <span className={`text-xs font-extrabold ${settings.preferredModel === "local" ? "text-amber-600" : "text-slate-700"}`}>
                    Local LLM Host (Offline)
                  </span>
                  <span className="text-[11px] opacity-85 mt-1 leading-normal font-medium">Connect to Ollama, LM Studio, or Llama.cpp running on your home Wi-Fi network.</span>
                </button>
              </div>
            </div>

            {/* Local LLM Hub Settings & WiFi Scanner (shows dynamically if 'local' is selected) */}
            {settings.preferredModel === "local" && (
              <LocalLlmHub settings={settings} onSaveSettings={onSaveSettings} />
            )}

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF4D4D]" />
                  Temperature: <span className="font-mono text-[#FF4D4D] font-bold">{settings.temperature}</span>
                </span>
                <span>
                  {settings.temperature <= 0.3
                    ? "Precise"
                    : settings.temperature <= 0.8
                    ? "Balanced"
                    : "Creative"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => onSaveSettings({ ...settings, temperature: Number(e.target.value) })}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF4D4D]"
                id="temperature-slider"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
              <span>v1.0.0</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                Chatterly Core <Heart className="w-2.5 h-2.5 text-[#FF4D4D] fill-[#FF4D4D]" />
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4.5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-xl transition-all cursor-pointer shadow-sm"
              id="save-settings-btn"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
