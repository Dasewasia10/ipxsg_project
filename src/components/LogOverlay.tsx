import { useEffect, useRef } from "react";
import { X, History } from "lucide-react";

import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

export interface LogEntry {
  block: string;
  index: number;
  speaker?: string;
  text: string;
}

interface Props {
  history: LogEntry[];
  onClose: () => void;
}

export default function LogOverlay({ history, onClose }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  // Gulir otomatis ke bagian paling bawah (teks terbaru) saat log dibuka
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative flex w-full max-w-4xl h-[85vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-blue-500">
            <History className="text-pink-400" /> {t.overlays.logTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        {/* Konten Riwayat */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 font-bold uppercase tracking-widest mt-10">
              {t.overlays.logHistory}
            </p>
          ) : (
            history.map((entry, i) => (
              <div
                key={`${entry.block}-${entry.index}-${i}`}
                className="flex flex-col gap-1 border-b border-white/5 pb-6"
              >
                {entry.speaker && (
                  <span className="text-pink-400 font-bold uppercase tracking-wider text-sm">
                    {entry.speaker}
                  </span>
                )}
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
            ))
          )}
          {/* Elemen jangkar untuk auto-scroll */}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
