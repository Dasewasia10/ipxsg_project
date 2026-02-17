import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Lock } from "lucide-react";

import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

export default function GalleryOverlay({ onClose }: { onClose: () => void }) {
  const [unlockedCGs, setUnlockedCGs] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // STATE BARU

  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  useEffect(() => {
    const saved = localStorage.getItem("ipxsg_unlocked_cgs");
    if (saved) setUnlockedCGs(JSON.parse(saved));
  }, []);

  const TOTAL_CG_SLOTS = Math.max(
    6,
    unlockedCGs.length +
      (unlockedCGs.length % 3 === 0 ? 0 : 3 - (unlockedCGs.length % 3)),
  );

  return (
    <>
      <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
        <div className="relative flex w-full max-w-5xl h-[85vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
              <ImageIcon className="text-pink-400" /> {t.overlays.galleryTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: TOTAL_CG_SLOTS }).map((_, index) => {
              const isUnlocked = index < unlockedCGs.length;
              const imgUrl = isUnlocked ? unlockedCGs[index] : null;

              return (
                <button
                  key={index}
                  onClick={() => isUnlocked && setSelectedImage(imgUrl)} // Buka gambar penuh jika diklik
                  disabled={!isUnlocked}
                  className={`aspect-video relative overflow-hidden border border-white/10 bg-black/50 group transition-transform hover:scale-105 hover:border-pink-500 shadow-lg ${isUnlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  {isUnlocked ? (
                    <img
                      src={imgUrl!}
                      alt={`CG ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center text-gray-700">
                      <Lock size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Locked
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- MODAL GAMBAR PENUH (LIGHTBOX) --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-150 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full">
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full CG"
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Klik gambar tidak menutup modal
          />
        </div>
      )}
    </>
  );
}
