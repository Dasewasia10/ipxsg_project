import { X, BookOpen } from "lucide-react";
import { GLOSSARY_DB } from "../data/glossary";
import { useGlossaryStore } from "../store/useGlossaryStore";

export default function TipsOverlay({ onClose }: { onClose: () => void }) {
  const unlockedTips = useGlossaryStore((state) => state.unlockedTips);

  return (
    <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-4xl h-[85vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-600">
            <BookOpen className="text-yellow-500" /> TIPS & Glossary
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {unlockedTips.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <BookOpen size={48} className="mb-4 opacity-50" />
              <p className="font-bold uppercase tracking-widest">
                Belum ada TIPS yang terbuka.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {unlockedTips.map((tipId) => {
                const term = GLOSSARY_DB[tipId];
                if (!term) return null;
                return (
                  <div
                    key={tipId}
                    className="border border-white/10 bg-[#151921] p-4 flex flex-col gap-2 hover:border-yellow-500/50 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider border-b border-white/5 pb-2">
                      {term.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {term.text}
                    </p>
                    {term.extra && (
                      <p className="text-xs text-pink-400 italic mt-auto pt-2">
                        * {term.extra}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
