import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import { GLOSSARY_DB } from "../data/glossary";
import { useGlossaryStore } from "../store/useGlossaryStore";

import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

export default function TipsOverlay({ onClose }: { onClose: () => void }) {
  const unlockedTips = useGlossaryStore((state) => state.unlockedTips);

  // State baru untuk melacak tip mana yang sedang diklik (terbuka di modal)
  const [selectedTip, setSelectedTip] = useState<string | null>(null);

  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  const convertMarkdown = (text: string) => {
    // 1. Safety check: Jika text kosong/undefined, kembalikan string kosong atau null
    if (!text) return "";

    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;

    return text.split(regex).map((part, index) => {
      // Cek apakah bagian ini adalah yang ditangkap oleh regex
      if (part.startsWith("**") && part.endsWith("**")) {
        // Hapus 4 bintang di awal dan akhir, lalu render Bold
        const content = part.slice(4, -4);
        return <strong key={index}>{content}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        // Hapus 2 bintang di awal dan akhir, lalu render Italic (em)
        const content = part.slice(2, -2);
        return <em key={index}>{content}</em>;
      }

      // Teks biasa
      return part;
    });
  };

  return (
    <>
      <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
        <div className="relative flex w-full max-w-4xl h-[85vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-600">
              <BookOpen className="text-yellow-500" /> {t.overlays.tipsTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white cursor-pointer"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {unlockedTips.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p className="font-bold uppercase tracking-widest">
                  {t.overlays.tipsHistory}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {unlockedTips.map((tipId) => {
                  const term = GLOSSARY_DB[tipId];
                  if (!term) return null;
                  return (
                    <button
                      key={tipId}
                      onClick={() => setSelectedTip(tipId)} // Buka modal saat diklik
                      className="group text-left border border-white/10 bg-[#151921] p-4 flex flex-col gap-2 cursor-pointer transition-all hover:scale-[1.02] hover:border-yellow-500/50 hover:shadow-lg"
                    >
                      <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wider border-b border-white/5 pb-2 transition-colors group-hover:text-yellow-300">
                        {term.title[language]}
                      </h3>

                      {/* line-clamp-3 akan memotong teks setelah 3 baris */}
                      <div className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                        {convertMarkdown(term.text[language])}
                      </div>

                      {term.extra && (
                        <p className="text-xs text-pink-400 mt-auto pt-2 line-clamp-1">
                          * {convertMarkdown(term.extra[language])}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL TIPS --- */}
      {selectedTip && (
        <div
          className="absolute inset-0 z-150 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setSelectedTip(null)} // Tutup modal jika area luar diklik
        >
          <div
            className="relative w-full max-w-2xl bg-[#151921] border border-yellow-500/40 p-8 lg:p-10 shadow-2xl flex flex-col gap-6 cursor-default animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup jika bagian dalam diklik
          >
            <button
              onClick={() => setSelectedTip(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-black/50 p-1.5 rounded cursor-pointer"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black text-yellow-400 uppercase tracking-widest border-b border-white/10 pb-4">
              {GLOSSARY_DB[selectedTip].title[language]}
            </h3>

            <div className="text-base text-gray-200 leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <p>{convertMarkdown(GLOSSARY_DB[selectedTip].text[language])}</p>

              {GLOSSARY_DB[selectedTip].extra && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-sm text-pink-400 italic font-medium">
                    *{" "}
                    {convertMarkdown(GLOSSARY_DB[selectedTip].extra[language])}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
