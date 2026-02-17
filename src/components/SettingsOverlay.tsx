import { X, Settings, Volume2, Type, Globe } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

export default function SettingsOverlay({ onClose }: { onClose: () => void }) {
  // Ambil state dan fungsi dari Zustand
  const {
    bgmVolume,
    sfxVolume,
    textSpeed,
    setBgmVolume,
    setSfxVolume,
    setTextSpeed,
  } = useSettingsStore();

  const { language, setLanguage } = useLanguageStore();
  const t = UI_TEXT[language];

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-2xl flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            <Settings className="text-pink-400" /> {t.settings.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 space-y-8 p-8 overflow-y-auto">
          {/* Audio */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2">
              <Volume2 size={16} /> {t.settings.audio}
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>{t.settings.bgm} (BGM)</span>
                <span>{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>{t.settings.sfx} (SFX)</span>
                <span>{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Gameplay */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2">
              <Type size={16} /> {t.settings.gameplay}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>{t.settings.textSpeed}</span>
                <span>{textSpeed}ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={textSpeed}
                onChange={(e) => setTextSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 flex-row-reverse"
              />
              <p className="text-[10px] text-gray-500">
                {t.settings.textSpeedDesc}
              </p>
            </div>
            {/* Tombol Bahasa */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span className="flex items-center gap-2">
                  <Globe size={14} /> {t.settings.language}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("id")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${language === "id" ? "bg-pink-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
                >
                  Indonesia
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${language === "en" ? "bg-pink-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
