import React, { useState } from "react";
import axios from "axios";
import {
  Play,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  Info,
  X,
} from "lucide-react";
import InGameUI from "../components/InGameUI";
import type { ChapterData } from "../types/script";

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

  // --- LOGIKA FETCH DARI R2 ---
  const startGame = async () => {
    setAppState("loading");
    try {
      // Mengambil file JSON prolog dari R2 milikmu
      // Sesuaikan nama filenya jika kamu menyimpannya dengan nama "ch0-prologue.json"
      const response = await axios.get<ChapterData>(
        "https://ipxsg-scripts-backend.vercel.app/scripts/ch01-prologue.json",
      );

      setChapterData(response.data);
      setAppState("playing");
      setOverlay("none");
    } catch (error) {
      console.error("Gagal memuat chapter dari R2:", error);
      alert(
        "Gagal memuat data cerita. Pastikan URL R2 dan nama file JSON benar, serta CORS di R2 sudah diizinkan.",
      );
      setAppState("menu");
    }
  };

  // --- RENDER OVERLAY (Menu Sistem) ---
  const renderOverlay = () => {
    if (overlay === "none") return null;

    const titles = {
      save: "Save Game",
      load: "Load Game",
      options: "Settings",
      gallery: "CG Gallery",
      credits: "Credits",
    };

    return (
      <div className="absolute inset-0 z-100 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
        <div className="w-full max-w-4xl h-[80vh] bg-[#0f1115] border border-white/10 shadow-2xl flex flex-col relative">
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500 uppercase">
              {titles[overlay]}
            </h2>
            <button
              onClick={() => setOverlay("none")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
            <p className="text-gray-500 tracking-[0.2em] uppercase font-bold animate-pulse">
              UI for {titles[overlay]} is under construction
            </p>
          </div>
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
          onQuit={() => {
            setAppState("menu");
            setChapterData(null);
          }}
          onOpenOverlay={(overlayType) => setOverlay(overlayType as any)}
        />
      )}
    </div>
  );
};

export default VisualNovel;
