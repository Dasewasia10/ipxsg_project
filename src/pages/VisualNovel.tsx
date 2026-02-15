import React, { useState } from "react";
import axios from "axios";
import {
  Play,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import InGameUI from "../components/InGameUI";
import SaveLoadOverlay from "../components/SaveLoadOverlay";
import type { SaveSlotData, ChapterData } from "../types/script";
import { useGameState } from "../store/useGameState";

const CURRENT_CHAPTER_URL =
  "https://ipxsg-scripts-backend.vercel.app/scripts/ch01-prologue.json";

const VisualNovel: React.FC = () => {
  // --- STATE HALAMAN ---
  const [appState, setAppState] = useState<"menu" | "loading" | "playing">(
    "menu",
  );
  const [overlay, setOverlay] = useState<
    "none" | "save" | "load" | "options" | "gallery" | "credits"
  >("none");

  // --- STATE DATA CERITA ---
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);

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
      const response = await axios.get<ChapterData>(CURRENT_CHAPTER_URL);
      setChapterData(response.data);
      setLoadTarget({
        block: "start",
        index: 0,
        bg: null,
        sprite: null,
        bgm: null,
      });
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

      setAppState("playing");
      setOverlay("none");
    } catch (error) {
      console.error(error);
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
          onClose={() => setOverlay("none")}
          onLoadGame={loadGame}
          currentChapterUrl={CURRENT_CHAPTER_URL}
          currentBlock={savePosition.block}
          currentIndex={savePosition.index}
          currentText={savePosition.text}
          currentBg={savePosition.bg}
          currentSprite={savePosition.sprite}
          currentBgm={savePosition.bgm}
        />
      );
    }

    // Modal lain seperti Settings/Credits bisa dibuat komponen terpisah nanti
    return (
      <div className="absolute inset-0 z-100 bg-black/80 flex items-center justify-center">
        <div className="bg-[#0f1115] p-8 border border-white/10 text-white">
          <p>UI {overlay} belum dibuat.</p>
          <button
            onClick={() => setOverlay("none")}
            className="mt-4 text-pink-500"
          >
            Close
          </button>
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

        <div className="relative z-10 w-full h-full flex flex-col justify-center px-16 lg:px-32">
          {/* Title Area */}
          <div className="mb-12 animate-in slide-in-from-left-10 duration-700">
            <h2 className="text-pink-500 font-bold tracking-[0.5em] text-sm mb-2 uppercase">
              A Fanmade Visual Novel
            </h2>
            <h1 className="text-6xl lg:text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
              IDOLY PRIDE
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-blue-500">
                STEINS;GATE&nbsp;
              </span>
            </h1>
          </div>

          {/* Menu Buttons */}
          <div className="flex flex-col gap-4 w-64 animate-in slide-in-from-left-10 duration-1000 delay-300">
            {[
              {
                label: "New Game",
                icon: <Play size={18} />,
                action: startGame,
              },
              {
                label: "Load Game",
                icon: <FolderOpen size={18} />,
                action: () => setOverlay("load"),
              },
              {
                label: "Options",
                icon: <Settings size={18} />,
                action: () => setOverlay("options"),
              },
              {
                label: "Gallery",
                icon: <ImageIcon size={18} />,
                action: () => setOverlay("gallery"),
              },
              {
                label: "Credits",
                icon: <Info size={18} />,
                action: () => setOverlay("credits"),
              },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                className="group relative flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 transition-all duration-300 transform -skew-x-12"
              >
                <div className="absolute inset-0 w-1 bg-pink-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <div className="transform skew-x-12 flex items-center gap-4 text-gray-300 group-hover:text-white font-bold tracking-widest uppercase">
                  <span className="text-pink-500 group-hover:text-pink-400 transition-colors">
                    {btn.icon}
                  </span>
                  {btn.label}
                </div>
              </button>
            ))}
          </div>
        </div>
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
        />
      )}
    </div>
  );
};

export default VisualNovel;
