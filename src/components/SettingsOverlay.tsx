import { X, Settings, Volume2, Type } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";

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

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-2xl flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            <Settings className="text-pink-400" /> Pengaturan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 space-y-8 p-8 overflow-y-auto">
          {/* Audio */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2">
              <Volume2 size={16} /> Audio
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>Background Music (BGM)</span>
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
                <span>Sound Effects (SFX)</span>
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
              <Type size={16} /> Gameplay
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                <span>Kecepatan Teks</span>
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
                Semakin kecil angkanya, semakin cepat teks muncul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
