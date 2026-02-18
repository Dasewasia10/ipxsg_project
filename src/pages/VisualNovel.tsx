import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Play,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  Info,
  BookOpen,
} from "lucide-react";
import InGameUI from "../components/InGameUI";
import SaveLoadOverlay from "../components/SaveLoadOverlay";
import SettingsOverlay from "../components/SettingsOverlay";
import CreditsOverlay from "../components/CreditsOverlay";
import GalleryOverlay from "../components/GalleryOverlay";
import type { SpriteDef, SaveSlotData, ChapterData } from "../types/script";
import { useGameState } from "../store/useGameState";
import TipsOverlay from "../components/TipsOverlay";

import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

import { useSettingsStore } from "../store/useSettingsStore";

const getChapterUrl = (baseName: string, lang: "id" | "en") =>
  `https://ipxsg-scripts-backend.vercel.app/scripts/${baseName}-${lang}.json`;

// Default chapter name (tanpa -id/-en)
const START_CHAPTER_BASE = "ch01-prologue";

const VisualNovel: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(false);

  // --- STATE HALAMAN ---
  const [appState, setAppState] = useState<"menu" | "loading" | "playing">(
    "menu",
  );
  const [overlay, setOverlay] = useState<
    "none" | "save" | "load" | "options" | "gallery" | "glossarium" | "credits"
  >("none");

  // --- STATE DATA CERITA ---
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);

  // --- STATE GAME SESSION ---
  const [gameSessionId, setGameSessionId] = useState(Date.now());

  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  const [activeChapterUrl, setActiveChapterUrl] = useState<string>(
    getChapterUrl(START_CHAPTER_BASE, language),
  );

  // ---> TAMBAHKAN KODE BGM MAIN MENU DI SINI <---
  const { bgmVolume } = useSettingsStore();
  const menuBgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("https://vnassets.dasewasia.my.id/bgm/shed-01.m4a");
    audio.loop = true;
    menuBgmRef.current = audio;

    return () => {
      audio.pause();
      menuBgmRef.current = null;
    };
  }, []);

  // Efek tambahan agar volume lagu langsung mengecil/membesar jika diubah di menu Options
  useEffect(() => {
    if (menuBgmRef.current) {
      menuBgmRef.current.volume = bgmVolume / 100;
    }
  }, [bgmVolume]);

  useEffect(() => {
    const audio = menuBgmRef.current;
    if (!audio || !hasInteracted) return;

    if (appState === "menu") {
      audio.play().catch((e) => console.error("Gagal putar audio:", e));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [appState, hasInteracted]);

  const handleStartGame = () => {
    setHasInteracted(true);
    // Jika posisi awal memang di menu, langsung putar
    if (appState === "menu" && menuBgmRef.current) {
      menuBgmRef.current.play();
    }
  };

  // Fungsi pembuat URL dinamis
  const buildChapterUrl = (chapterId: string, lang: string) => {
    return `https://ipxsg-scripts-backend.vercel.app/scripts/${chapterId}-${lang}.json`;
  };

  // State untuk melacak posisi save dari InGameUI
  const [savePosition, setSavePosition] = useState({
    block: "start",
    index: 0,
    text: "",
    bg: null as string | null,
    sprites: [] as SpriteDef[],
    bgm: null as string | null,
  });

  // State untuk me-load game
  const [loadTarget, setLoadTarget] = useState({
    block: "start",
    index: 0,
    bg: null as string | null,
    sprites: [] as SpriteDef[],
    bgm: null as string | null,
  });

  // FUNGSI START NEW GAME
  const startGame = async () => {
    setAppState("loading");
    useGameState.getState().resetGame(); // Reset Global State kalau New Game!

    const url = getChapterUrl(START_CHAPTER_BASE, language);

    try {
      setActiveChapterUrl(url);
      const response = await axios.get<ChapterData>(url);
      setChapterData(response.data);
      setLoadTarget({
        block: "start",
        index: 0,
        bg: null,
        sprites: [],
        bgm: null,
      });

      setGameSessionId(Date.now());
      setAppState("playing");
      setOverlay("none");
    } catch (error) {
      console.error(error);
      setAppState("menu");
    }
  };

  // FUNGSI LOAD GAME
  const loadGame = async (saveData: SaveSlotData) => {
    setAppState("loading");
    useGameState.setState(saveData.gameStateSnapshot);

    try {
      setActiveChapterUrl(saveData.chapterUrl);
      const response = await axios.get<ChapterData>(saveData.chapterUrl);
      setChapterData(response.data);

      // Masukkan juga data memori visual & audio
      setLoadTarget({
        block: saveData.blockId,
        index: saveData.lineIndex,
        bg: saveData.savedBg || null,
        sprites: saveData.savedSprites || [],
        bgm: saveData.savedBgm || null,
      });

      setGameSessionId(Date.now());
      setAppState("playing");
      setOverlay("none");
    } catch (error) {
      console.error(error);
      setAppState("menu");
    }
  };

  // FUNGSI GANTI CHAPTER
  const handleChangeChapter = async (chapterId: string) => {
    setAppState("loading");

    // Rakit URL-nya di sini!
    const nextUrl = buildChapterUrl(chapterId, language);

    try {
      setActiveChapterUrl(nextUrl);
      const response = await axios.get<ChapterData>(nextUrl);
      setChapterData(response.data);

      setLoadTarget({
        block: "start",
        index: 0,
        bg: null,
        sprites: [],
        bgm: null,
      });
      setGameSessionId(Date.now());
      setAppState("playing");
      setOverlay("none");
    } catch (error) {
      console.error("Gagal memuat chapter selanjutnya:", error);
      alert("Gagal memuat chapter selanjutnya. Pastikan URL JSON benar.");
      setAppState("menu");
    }
  };

  // ==========================================
  // EFEK HOT-SWAP BAHASA CERITA
  // ==========================================
  useEffect(() => {
    // Jika game sedang berjalan dan URL aktif tersedia
    if (appState === "playing" && activeChapterUrl) {
      // Ganti akhiran URL dengan bahasa yang baru dipilih (-id.json atau -en.json)
      const newUrl = activeChapterUrl.replace(
        /-id\.json|-en\.json/,
        `-${language}.json`,
      );

      // Jika URL berubah, fetch ulang secara diam-diam lalu timpa state ceritanya
      if (newUrl !== activeChapterUrl) {
        setActiveChapterUrl(newUrl);
        axios
          .get<ChapterData>(newUrl)
          .then((res) => {
            setChapterData(res.data);
          })
          .catch((err) =>
            console.error("Gagal melakukan hot-swap bahasa:", err),
          );
      }
    }
  }, [language, appState, activeChapterUrl]);

  // RENDER MODAL
  const renderOverlay = () => {
    if (overlay === "none") return null;

    // Gunakan komponen yang baru kita buat khusus untuk Save/Load
    if (overlay === "save" || overlay === "load") {
      return (
        <SaveLoadOverlay
          mode={overlay}
          inGame={appState === "playing"}
          onClose={() => setOverlay("none")}
          onLoadGame={loadGame}
          currentChapterUrl={activeChapterUrl}
          currentChapterTitle={chapterData?.title || "Unknown Chapter"}
          currentBlock={savePosition.block}
          currentIndex={savePosition.index}
          currentText={savePosition.text}
          currentBg={savePosition.bg}
          currentSprites={savePosition.sprites}
          currentBgm={savePosition.bgm}
        />
      );
    }

    if (overlay === "options") {
      return <SettingsOverlay onClose={() => setOverlay("none")} />;
    }

    if (overlay === "gallery") {
      return <GalleryOverlay onClose={() => setOverlay("none")} />;
    }

    if (overlay === "credits") {
      return <CreditsOverlay onClose={() => setOverlay("none")} />;
    }

    if (overlay === "glossarium") {
      return <TipsOverlay onClose={() => setOverlay("none")} />;
    }
  };

  const StartOverlay = ({ onStart }: { onStart: () => void }) => {
    return (
      <div
        onClick={onStart} // Membuat seluruh layar bisa diklik untuk kenyamanan
        className="fixed inset-0 z-200 flex items-center justify-center bg-[#0a0c10] backdrop-blur-sm font-sans cursor-pointer animate-in fade-in duration-500"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Teks Peringatan Sistem / Atmosfer */}
          <div className="text-pink-500 font-bold tracking-[0.5em] text-[10px] md:text-xs uppercase text-center animate-pulse">
            System Initialization
          </div>

          {/* Tombol Start Bergaya Main Menu */}
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center px-10 py-4 bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 transition-all duration-300 transform -skew-x-12 shadow-2xl cursor-pointer"
          >
            {/* Aksen Garis Kiri yang Muncul Saat Hover */}
            <div className="absolute inset-0 z-20 w-1 bg-pink-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

            {/* Teks Tombol (Skew dikembalikan agar teks tetap tegak) */}
            <div className="transform skew-x-12 flex items-center gap-3 text-gray-300 group-hover:text-white font-bold tracking-[0.2em] md:tracking-widest uppercase text-sm md:text-base">
              {t.overlays.startButton}
            </div>
          </button>

          {/* Dekorasi Garis Bawah */}
          <div className="h-px w-32 bg-linear-to-r from-transparent via-white/20 to-transparent mt-4"></div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: MAIN MENU
  // ==========================================
  if (appState === "menu") {
    return (
      <div className="relative w-full h-screen bg-[#0a0c10] text-white overflow-hidden font-sans selection:bg-pink-500">
        {!hasInteracted && <StartOverlay onStart={handleStartGame} />}
        {/* Background Main Menu */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage:
              "url('https://vnassets.dasewasia.my.id/bg/nightsky-night.webp')",
          }} // Bisa diganti Key Visual lain
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent" />

        {renderOverlay()}

        {/* PERUBAHAN: px-16 diganti jadi px-6 untuk mobile, lalu md:px-16 untuk desktop */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-10 md:px-16 lg:px-32">
          {/* Title Area */}
          {/* PERUBAHAN: margin-bottom dikurangi untuk mobile */}
          <div className="mb-8 md:mb-12 animate-in slide-in-from-left-10 duration-700">
            {/* PERUBAHAN: text dan tracking diperkecil di mobile */}
            <h2 className="text-pink-500 font-bold tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm mb-1 md:mb-2 uppercase">
              A Fanmade Visual Novel (Pilot)
            </h2>
            {/* PERUBAHAN: text-6xl jadi text-5xl di mobile, ditambahkan leading-none agar tidak menumpuk jaraknya */}
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.5)] leading-none">
              IPx
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-blue-500">
                SG&nbsp;
              </span>
            </h1>
          </div>

          {/* Menu Buttons */}
          {/* PERUBAHAN: gap dan lebar tombol (w-52) dikurangi untuk mobile */}
          <div className="flex flex-col gap-3 md:gap-4 w-52 md:w-64 animate-in slide-in-from-left-10 duration-1000 delay-300">
            {[
              {
                label: t.mainMenu.newGame,
                icon: <Play className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: startGame,
              },
              {
                label: t.mainMenu.loadGame,
                icon: <FolderOpen className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("load"),
              },
              {
                label: t.mainMenu.options,
                icon: <Settings className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("options"),
              },
              {
                label: t.mainMenu.gallery,
                icon: <ImageIcon className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("gallery"),
              },
              {
                label: t.mainMenu.glossary,
                icon: <BookOpen className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("glossarium"),
              },
              {
                label: t.mainMenu.credits,
                icon: <Info className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("credits"),
              },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                // PERUBAHAN: padding dikurangi pada mobile (px-4 py-2.5)
                className="group relative flex items-center gap-3 md:gap-4 px-4 py-2.5 md:px-6 md:py-3 bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 transition-all duration-300 transform -skew-x-12"
              >
                <div className="absolute inset-0 w-1 bg-pink-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                {/* PERUBAHAN: ukuran font diubah ke text-xs untuk mobile, dan tracking sedikit direnggangkan */}
                <div className="transform skew-x-12 flex items-center gap-3 md:gap-4 text-gray-300 group-hover:text-white font-bold tracking-wider md:tracking-widest text-xs md:text-base uppercase">
                  <span className="text-pink-500 group-hover:text-pink-400 transition-colors">
                    {btn.icon}
                  </span>
                  {btn.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-md border-t border-white/10 py-2">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-1">
            <div className="text-center md:text-left">
              <p className="text-[16px] md:text-[20px] text-gray-500 font-mono">
                {t.mainMenu.footerProject}
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-[16px] md:text-[20px] text-gray-600 font-mono">
                {t.mainMenu.footerDisclaimer}
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOADING SCREEN
  // ==========================================
  if (appState === "loading") {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-[0.3em] uppercase font-bold text-gray-400">
          Diverging Timeline...
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER: IN-GAME
  // ==========================================
  return (
    <div className="w-full h-screen relative overflow-hidden">
      {renderOverlay()}
      {chapterData && (
        <InGameUI
          key={gameSessionId}
          chapterData={chapterData}
          initialBlock={loadTarget.block}
          initialIndex={loadTarget.index}
          initialBg={loadTarget.bg}
          initialSprites={loadTarget.sprites}
          initialBgm={loadTarget.bgm}
          onQuit={() => {
            setAppState("menu");
            setChapterData(null);
          }}
          onOpenOverlay={(
            overlayType,
            block,
            index,
            text,
            bg,
            sprites,
            bgm,
          ) => {
            setSavePosition({ block, index, text, bg, sprites, bgm });
            setOverlay(overlayType as any);
          }}
          onChangeChapter={handleChangeChapter}
        />
      )}
    </div>
  );
};

export default VisualNovel;
