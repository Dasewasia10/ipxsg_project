import React, { useState } from "react";
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
import type { SaveSlotData, ChapterData } from "../types/script";
import { useGameState } from "../store/useGameState";
import TipsOverlay from "../components/TipsOverlay";

const CURRENT_CHAPTER_URL =
  "https://ipxsg-scripts-backend.vercel.app/scripts/ch01-prologue.json";

const VisualNovel: React.FC = () => {
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

  const [activeChapterUrl, setActiveChapterUrl] =
    useState<string>(CURRENT_CHAPTER_URL);

  // State untuk melacak posisi save dari InGameUI
  const [savePosition, setSavePosition] = useState({
    block: "start",
    index: 0,
    text: "",
    bg: null as string | null,
    sprite: null as string | null,
    bgm: null as string | null,
  });

  // State untuk me-load game
  const [loadTarget, setLoadTarget] = useState({
    block: "start",
    index: 0,
    bg: null as string | null,
    sprite: null as string | null,
    bgm: null as string | null,
  });

  // FUNGSI START NEW GAME
  const startGame = async () => {
    setAppState("loading");
    useGameState.getState().resetGame(); // Reset Global State kalau New Game!
    try {
      setActiveChapterUrl(CURRENT_CHAPTER_URL);
      const response = await axios.get<ChapterData>(CURRENT_CHAPTER_URL);
      setChapterData(response.data);
      setLoadTarget({
        block: "start",
        index: 0,
        bg: null,
        sprite: null,
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
        sprite: saveData.savedSprite || null,
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
  const handleChangeChapter = async (nextUrl: string) => {
    setAppState("loading");
    try {
      setActiveChapterUrl(nextUrl);
      const response = await axios.get<ChapterData>(nextUrl);
      setChapterData(response.data);

      // Reset kordinat load target layaknya New Game
      setLoadTarget({
        block: "start",
        index: 0,
        bg: null,
        sprite: null,
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
          currentSprite={savePosition.sprite}
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

    // Modal lain seperti Settings/Credits bisa dibuat komponen terpisah nanti
    // return (
    //   <div className="absolute inset-0 z-100 bg-black/80 flex items-center justify-center">
    //     <div className="bg-[#0f1115] p-8 border border-white/10 text-white">
    //       <p>UI {overlay} belum dibuat.</p>
    //       <button
    //         onClick={() => setOverlay("none")}
    //         className="mt-4 text-pink-500"
    //       >
    //         Close
    //       </button>
    //     </div>
    //   </div>
    // );
  };

  // ==========================================
  // RENDER: MAIN MENU
  // ==========================================
  if (appState === "menu") {
    return (
      <div className="relative w-full h-screen bg-[#0a0c10] text-white overflow-hidden font-sans selection:bg-pink-500">
        {/* Background Main Menu */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage:
              "url('https://api.dasewasia.my.id/bg/nightsky-night.webp')",
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
              A Fanmade Visual Novel
            </h2>
            {/* PERUBAHAN: text-6xl jadi text-5xl di mobile, ditambahkan leading-none agar tidak menumpuk jaraknya */}
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.5)] leading-none">
              IDOLY PRIDE
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-blue-500">
                STEINS;GATE&nbsp;
              </span>
            </h1>
          </div>

          {/* Menu Buttons */}
          {/* PERUBAHAN: gap dan lebar tombol (w-52) dikurangi untuk mobile */}
          <div className="flex flex-col gap-3 md:gap-4 w-52 md:w-64 animate-in slide-in-from-left-10 duration-1000 delay-300">
            {[
              {
                label: "New Game",
                icon: <Play className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: startGame,
              },
              {
                label: "Load Game",
                icon: <FolderOpen className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("load"),
              },
              {
                label: "Options",
                icon: <Settings className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("options"),
              },
              {
                label: "Gallery",
                icon: <ImageIcon className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("gallery"),
              },
              {
                label: "Glossarium",
                icon: <BookOpen className="w-4 h-4 md:w-4.5 md:h-4.5" />,
                action: () => setOverlay("glossarium"),
              },
              {
                label: "Credits",
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
                IPXSG PROJECT
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-[16px] md:text-[20px] text-gray-600 font-mono">
                FAN-MADE • NOT AFFILIATED WITH QUALIARTS/CYBERAGENT
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
          initialSprite={loadTarget.sprite}
          initialBgm={loadTarget.bgm}
          onQuit={() => {
            setAppState("menu");
            setChapterData(null);
          }}
          onOpenOverlay={(overlayType, block, index, text, bg, sprite, bgm) => {
            setSavePosition({ block, index, text, bg, sprite, bgm });
            setOverlay(overlayType as any);
          }}
          onChangeChapter={handleChangeChapter}
        />
      )}
    </div>
  );
};

export default VisualNovel;
