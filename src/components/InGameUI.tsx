import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  FastForward,
  Save,
  FolderOpen,
  LogOut,
  History,
} from "lucide-react";
import type {
  ScriptLine,
  ChapterData,
  StateChange,
  ChoiceCondition,
  ChoiceOption,
} from "../types/script";
import { useGameState } from "../store/useGameState";

interface Props {
  chapterData: ChapterData;
  onQuit: () => void;
  onOpenOverlay: (overlay: string) => void;
}

const InGameUI: React.FC<Props> = ({ chapterData, onQuit, onOpenOverlay }) => {
  // --- STATE MESIN ---
  const [currentBlock, setCurrentBlock] = useState<string>("start");
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- STATE TEKS ---
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // --- STATE VISUAL PERSISTEN ---
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const [currentSprite, setCurrentSprite] = useState<string | null>(null);

  // --- REFS ---
  const typeIntervalRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Ambil baris skrip yang sedang aktif
  const activeScript = chapterData.blocks[currentBlock] || [];
  const currentLine = activeScript[currentIndex];

  // ==========================================
  // LOGIKA EVALUASI STATE (ZUSTAND)
  // ==========================================

  // 1. Eksekutor Perubahan State
  const executeStateChanges = (changes?: StateChange[]) => {
    if (!changes || changes.length === 0) return;

    const currentState = useGameState.getState();
    const updates: Record<string, any> = {};

    changes.forEach((change) => {
      const { target, operation, value } = change;
      if (currentState.hasOwnProperty(target)) {
        if (operation === "set") {
          updates[target] = value;
        } else if (operation === "add") {
          let newValue =
            (currentState[target as keyof typeof currentState] as number) +
            value;
          // Clamping nilai 0-100 untuk variabel tertentu agar tidak minus/over
          if (["makinoSanity", "trustMei", "manaAwareness"].includes(target)) {
            newValue = Math.max(0, Math.min(100, newValue));
          }
          updates[target] = newValue;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      useGameState.setState(updates);
    }
  };

  // 2. Evaluator Kondisi Pilihan (Choice)
  const isConditionMet = (condition?: ChoiceCondition) => {
    if (!condition) return true; // Munculkan jika tidak ada syarat

    const currentState = useGameState.getState();
    const stateValue = currentState[
      condition.target as keyof typeof currentState
    ] as number;

    switch (condition.operator) {
      case ">":
        return stateValue > condition.value;
      case ">=":
        return stateValue >= condition.value;
      case "<":
        return stateValue < condition.value;
      case "<=":
        return stateValue <= condition.value;
      case "==":
        return stateValue === condition.value;
      default:
        return true;
    }
  };

  // ==========================================
  // LOGIKA NAVIGASI CERITA
  // ==========================================

  const advance = () => {
    if (currentIndex < activeScript.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Jika blok habis tanpa ada pilihan (Choice), anggap chapter tamat / kembali ke menu
      onQuit();
    }
  };

  const handleBoxClick = () => {
    // Jangan izinkan klik jika sedang di layar pilihan
    if (currentLine?.type === "choice_selection") return;

    if (isTyping) {
      // Selesaikan ketikan instan
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(currentLine?.text || "");
      setIsTyping(false);
    } else {
      advance();
    }
  };

  const handleChoiceClick = (choice: ChoiceOption) => {
    // 1. Jalankan efek state jika ada (misal: Sanity turun karena milih ini)
    executeStateChanges(choice.stateChanges);

    // 2. Pindah ke blok baru
    setCurrentBlock(choice.nextBlock);
    setCurrentIndex(0);
  };

  // ==========================================
  // EFEK EKSEKUSI BARIS BARU
  // ==========================================
  useEffect(() => {
    if (!currentLine) return;

    // 1. Eksekusi Inline State Changes (Perubahan pasif dari dialog)
    executeStateChanges(currentLine.stateChanges);

    // 2. Proses Visual (Update Background & Sprite)
    if (currentLine.visuals?.background) {
      setCurrentBg(currentLine.visuals.background);
    }
    if (currentLine.visuals?.sprite !== undefined) {
      // Jika diisi "none", hapus sprite dari layar. Jika ada URL, tampilkan.
      setCurrentSprite(
        currentLine.visuals.sprite === "none"
          ? null
          : currentLine.visuals.sprite,
      );
    }

    // 3. Proses Audio
    if (currentLine.audio) {
      if (currentLine.audio.bgmAction === "stop" && bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      } else if (currentLine.audio.bgm) {
        if (bgmRef.current) bgmRef.current.pause();
        bgmRef.current = new Audio(currentLine.audio.bgm);
        bgmRef.current.loop = true;
        bgmRef.current
          .play()
          .catch((e) => console.warn("Autoplay audio dicegah browser:", e));
      }
    }

    // 4. Proses Teks (Typewriter)
    if (currentLine.text) {
      setIsTyping(true);
      setDisplayedText("");
      let charIndex = 0;
      const fullText = currentLine.text;

      typeIntervalRef.current = window.setInterval(() => {
        charIndex++;
        setDisplayedText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setIsTyping(false);
        }
      }, 30); // Kecepatan teks
    } else {
      setIsTyping(false);
      setDisplayedText("");

      // Jika baris ini hanya berisi penggantian background (tanpa teks & bukan choice), langsung auto-advance
      if (currentLine.type === "background") {
        setTimeout(() => {
          advance();
        }, 500); // Jeda 0.5 detik agar background sempat muncul sebelum dialog masuk
      }
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [currentIndex, currentBlock]);

  // Bersihkan audio jika keluar dari komponen
  useEffect(() => {
    return () => {
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, []);

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="absolute inset-0 bg-black overflow-hidden selection:bg-pink-500">
      {/* 1. LAYER BACKGROUND */}
      {currentBg && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ backgroundImage: `url('${currentBg}')` }}
        />
      )}

      {/* 2. LAYER SPRITE (Lawan Bicara) */}
      {currentSprite && (
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10">
          <img
            src={currentSprite}
            className="h-[80%] lg:h-[90%] object-contain drop-shadow-2xl animate-in fade-in duration-500"
            alt="Sprite"
          />
        </div>
      )}

      {/* 3. LAYER CHOICES (Percabangan) */}
      {currentLine?.type === "choice_selection" && !isTyping && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="flex flex-col gap-4 w-full max-w-2xl animate-in slide-in-from-bottom-10">
            {currentLine.choices
              ?.filter((choice) => isConditionMet(choice.condition))
              .map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoiceClick(choice)}
                  className="group relative px-8 py-4 bg-[#0f131a]/90 border border-white/20 hover:border-pink-500 transition-all duration-300 transform -skew-x-6 shadow-lg"
                >
                  <div className="absolute inset-0 w-1 bg-pink-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="transform skew-x-6 block text-center text-lg font-medium tracking-wide text-gray-200 group-hover:text-white">
                    {choice.text}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 4. LAYER TEXT BOX & QUICK MENU */}
      {(currentLine?.type === "dialogue" ||
        (currentLine?.type === "choice_selection" && currentLine?.text)) && (
        <div className="absolute bottom-0 w-full z-40 flex flex-col items-center pb-6 lg:pb-10 px-4">
          {/* Quick Menu */}
          <div className="w-full max-w-5xl flex justify-end mb-2 pr-4 lg:pr-8">
            <div className="flex gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded border border-white/10 shadow-lg pointer-events-auto">
              {[
                {
                  label: "Save",
                  icon: <Save size={14} />,
                  action: () => onOpenOverlay("save"),
                },
                {
                  label: "Load",
                  icon: <FolderOpen size={14} />,
                  action: () => onOpenOverlay("load"),
                },
                { label: "Menu", icon: <LogOut size={14} />, action: onQuit },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest rounded text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {btn.icon}{" "}
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dialog Box */}
          <div
            className={`w-full max-w-5xl relative group ${currentLine?.type !== "choice_selection" ? "cursor-pointer pointer-events-auto" : "pointer-events-none"}`}
            onClick={handleBoxClick}
          >
            {/* Nameplate */}
            {currentLine.speakerName && (
              <div className="absolute -top-5 left-0 lg:left-8 z-50">
                <div className="bg-white text-black px-8 py-1.5 transform -skew-x-12 border-l-[6px] border-pink-600 shadow-lg">
                  <div className="transform skew-x-12 font-bold tracking-wider text-base uppercase">
                    {currentLine.speakerName}
                  </div>
                </div>
              </div>
            )}

            <div
              className="relative bg-[#0f131a]/95 backdrop-blur-lg border-t border-white/10 shadow-2xl p-6 lg:p-8 min-h-40 lg:min-h-45"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)",
              }}
            >
              <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/30 to-transparent"></div>

              <div className="relative z-10 h-full">
                <p className="text-lg lg:text-xl font-medium leading-relaxed text-gray-100 drop-shadow-md whitespace-pre-wrap">
                  {displayedText}
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-pink-500 ml-1 animate-pulse align-sub"></span>
                  )}
                </p>
              </div>

              {!isTyping && currentLine?.type === "dialogue" && (
                <div className="absolute bottom-4 right-8 animate-bounce text-pink-500">
                  <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-pink-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InGameUI;
