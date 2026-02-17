import { X, Info } from "lucide-react";
import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

export default function CreditsOverlay({ onClose }: { onClose: () => void }) {
  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-3xl h-[80vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header dengan Tombol Close */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            <Info className="text-pink-400" /> {t.overlays.creditTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        {/* Area Teks Statis (Bisa di-scroll manual) */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div className="flex flex-col items-center justify-center text-center space-y-12 pb-10">
            {/* --- JUDUL PROJECT --- */}
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                IDOLY PRIDE <span className="text-pink-500">VN</span>
              </h2>
              <p className="text-pink-400 font-bold tracking-[0.5em] text-xs uppercase">
                A Fanmade Project
              </p>
            </div>

            {/* --- MAIN CREDITS --- */}
            <div className="space-y-8 w-full border-b border-white/10 pb-12">
              <div className="space-y-2">
                <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditDirector}
                </h3>
                <p className="text-xl font-medium text-gray-200">Dasewasia</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditDisclaimer}
                  {/* Original 'IDOLY PRIDE' IP By */}
                </h3>
                <p className="text-lg font-medium text-gray-200">
                  QualiArts, Music Ray'n, Straight Edge
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditEngine}
                </h3>
                <p className="text-lg font-medium text-gray-200">
                  React.js & Tailwind CSS v4
                </p>
              </div>
            </div>

            {/* --- ASSET CREDITS (PLACEHOLDERS) --- */}
            <div className="space-y-8 w-full pt-4">
              <h3 className="text-2xl font-black uppercase tracking-widest text-pink-500 mb-6">
                {t.overlays.creditExAssets}
              </h3>

              {/* BGM & SFX */}
              <div className="space-y-2">
                <h4 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditBgm}
                </h4>
                <div className="text-md font-medium text-gray-300 space-y-1">
                  <p>
                    Tomomi_Kato - Like the wind (
                    <a
                      className="text-amber-300"
                      href="https://pixabay.com/id/music/klasik-modern-like-the-wind-267440/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pixabay
                    </a>
                    )
                  </p>
                  <p>[Nama Kreator / Situs] - Judul Lagu BGM</p>
                  <p>[Nama Kreator / Situs] - Judul SFX</p>
                  <p className="text-sm text-gray-500 italic">
                    {t.overlays.creditBgmThanks}
                  </p>
                </div>
              </div>

              {/* Visual & Fanart */}
              <div className="space-y-2 pt-4">
                <h4 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditArt}
                </h4>
                <div className="text-md font-medium text-gray-300 space-y-1">
                  <p>
                    描愛ゆう - CG Scene 1 Placeholder (
                    <a
                      className="text-amber-300"
                      href="https://www.pixiv.net/en/users/44831173"
                      target="_blank"
                    >
                      Pixiv
                    </a>
                    )
                  </p>
                  <p>[Nama Illustrator] - CG Scene (Link Sosmed/Pixiv)</p>
                  <p>
                    Noraneko - Sprite Placeholder (
                    <a
                      className="text-amber-300"
                      href="https://noranekogames.itch.io"
                      target="_blank"
                    >
                      @Noraneko Games
                    </a>
                    )
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    {t.overlays.creditArtThanks}
                  </p>
                </div>
              </div>

              {/* Other Assets */}
              <div className="space-y-2 pt-4">
                <h4 className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                  {t.overlays.creditThanks}
                </h4>
                <div className="text-md font-medium text-gray-300 space-y-1">
                  <p>
                    stream - Latar Belakang (Background) Placeholder (
                    <a
                      className="text-amber-300"
                      href="https://www.pixiv.net/en/artworks/47074841"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pixiv
                    </a>
                    )
                  </p>
                  <p>[Nama / Sumber] - Latar Belakang (Background)</p>
                  <p>[Nama / Sumber] - UI/UX Inspiration</p>
                </div>
              </div>
            </div>

            {/* --- KUTIPAN PENUTUP --- */}
            <div className="mt-20 pt-10 text-pink-500 italic font-bold">
              {t.overlays.creditQuote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
