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
  initialBlock?: string;
  initialIndex?: number;
  initialBg?: string | null;
  initialSprite?: string | null;
  initialBgm?: string | null;
  onQuit: () => void;
  // Prop fungsi ini sekarang mengirimkan data visual yang sedang aktif juga
  onOpenOverlay: (
    overlay: string,
    block: string,
    index: number,
    text: string,
    bg: string | null,
    sprite: string | null,
    bgm: string | null,
  ) => void;
}

const InGameUI: React.FC<Props> = ({
  chapterData,
  initialBlock = "start",
  initialIndex = 0,
  initialBg = null,
  initialSprite = null,
  initialBgm = null,
  onQuit,
  onOpenOverlay,
}) => {
  const [currentBlock, setCurrentBlock] = useState<string>(initialBlock);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false); // STATE SKIP KEMBALI

  // STATE VISUAL & AUDIO (Diisi dengan initial data dari Save Game)
  const [currentBg, setCurrentBg] = useState<string | null>(initialBg);
  const [currentSprite, setCurrentSprite] = useState<string | null>(
    initialSprite,
  );
  const [currentBgmUrl, setCurrentBgmUrl] = useState<string | null>(initialBgm);

  const typeIntervalRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const activeScript = chapterData.blocks[currentBlock] || [];
  const currentLine = activeScript[currentIndex];

  // ==========================================
  // LOGIKA AUDIO LOAD (Saat komponen pertama kali dirender)
  // ==========================================
  useEffect(() => {
    if (initialBgm) {
      bgmRef.current = new Audio(initialBgm);
      bgmRef.current.loop = true;
      bgmRef.current
        .play()
        .catch((e) => console.warn("Browser mencegah autoplay", e));
    }
    return () => {
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, [initialBgm]);

  // ==========================================
  // ZUSTAND LOGIC
  // ==========================================
  const executeStateChanges = (changes?: StateChange[]) => {
    if (!changes || changes.length === 0) return;
    const currentState = useGameState.getState();
    const updates: Record<string, any> = {};

    changes.forEach(({ target, operation, value }) => {
      if (currentState.hasOwnProperty(target)) {
        if (operation === "set") updates[target] = value;
        else if (operation === "add") {
          let newValue =
            (currentState[target as keyof typeof currentState] as number) +
            value;
          if (["makinoSanity", "trustMei", "manaAwareness"].includes(target)) {
            newValue = Math.max(0, Math.min(100, newValue));
          }
          updates[target] = newValue;
        }
      }
    });
    if (Object.keys(updates).length > 0) useGameState.setState(updates);
  };

  const isConditionMet = (condition?: ChoiceCondition) => {
    if (!condition) return true;
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
  // NAVIGASI
  // ==========================================
  const advance = () => {
    if (currentIndex < activeScript.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onQuit();
    }
  };

  const handleBoxClick = () => {
    if (currentLine?.type === "choice_selection") return;

    // Matikan skip jika pemain mengklik layar manual
    if (isSkipping) setIsSkipping(false);

    if (isTyping) {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(currentLine?.text || "");
      setIsTyping(false);
    } else {
      advance();
    }
  };

  const handleChoiceClick = (choice: ChoiceOption) => {
    executeStateChanges(choice.stateChanges);
    setCurrentBlock(choice.nextBlock);
    setCurrentIndex(0);
    setIsSkipping(false); // Matikan skip setelah memilih
  };

  // ==========================================
  // EFEK BARIS BARU
  // ==========================================
  useEffect(() => {
    if (!currentLine) return;
    executeStateChanges(currentLine.stateChanges);

    if (currentLine.visuals?.background)
      setCurrentBg(currentLine.visuals.background);
    if (currentLine.visuals?.sprite !== undefined) {
      setCurrentSprite(
        currentLine.visuals.sprite === "none"
          ? null
          : currentLine.visuals.sprite,
      );
    }

    if (currentLine.audio) {
      if (currentLine.audio.bgmAction === "stop") {
        setCurrentBgmUrl(null);
        if (bgmRef.current) {
          bgmRef.current.pause();
          bgmRef.current = null;
        }
      } else if (currentLine.audio.bgm) {
        setCurrentBgmUrl(currentLine.audio.bgm);
        if (bgmRef.current) bgmRef.current.pause();
        bgmRef.current = new Audio(currentLine.audio.bgm);
        bgmRef.current.loop = true;
        bgmRef.current.play().catch((e) => console.warn(e));
      }
    }

    if (currentLine.text) {
      setIsTyping(true);
      setDisplayedText("");
      let charIndex = 0;
      const fullText = currentLine.text;

      // Jika mode skip aktif, hapus interval dan langsung tamatkan baris ini dalam sekejap
      if (isSkipping) {
        setDisplayedText(fullText);
        setIsTyping(false);
        // Beri jeda sangat kecil sebelum loncat ke baris berikutnya
        const skipTimer = setTimeout(() => advance(), 150);
        return () => clearTimeout(skipTimer);
      }

      typeIntervalRef.current = window.setInterval(() => {
        charIndex++;
        setDisplayedText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setIsTyping(false);
        }
      }, 30);
    } else {
      setIsTyping(false);
      setDisplayedText("");
      if (currentLine.type === "background") advance();
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [currentIndex, currentBlock, isSkipping]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black selection:bg-pink-500">
      {currentBg && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ backgroundImage: `url('${currentBg}')` }}
        />
      )}
      {currentSprite && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
          <img
            src={currentSprite}
            className="h-[80%] object-contain drop-shadow-2xl animate-in fade-in duration-500 lg:h-[90%]"
            alt="Sprite"
          />
        </div>
      )}

      {currentLine?.type === "choice_selection" && !isTyping && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col gap-4 animate-in slide-in-from-bottom-10">
            {currentLine.choices
              ?.filter((c) => isConditionMet(c.condition))
              .map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoiceClick(choice)}
                  className="group relative border border-white/20 bg-[#0f131a]/90 px-8 py-4 shadow-lg transition-all duration-300 hover:border-pink-500 transform -skew-x-6"
                >
                  <div className="absolute inset-0 w-1 -translate-x-full bg-pink-500 transition-transform duration-300 group-hover:translate-x-0" />
                  <span className="block text-center text-lg font-medium tracking-wide text-gray-200 group-hover:text-white transform skew-x-6">
                    {choice.text}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {(currentLine?.type === "dialogue" ||
        (currentLine?.type === "choice_selection" && currentLine?.text)) && (
        <div className="absolute bottom-0 z-40 flex w-full flex-col items-center px-4 pb-6 lg:pb-10">
          {/* QUICK MENU YANG DIPERBAIKI */}
          <div className="mb-2 flex w-full max-w-5xl justify-end pr-4 lg:pr-8">
            <div className="pointer-events-auto flex gap-1 rounded border border-white/10 bg-black/60 p-1.5 shadow-lg backdrop-blur-md">
              <button
                onClick={() =>
                  onOpenOverlay(
                    "log",
                    currentBlock,
                    currentIndex,
                    displayedText,
                    currentBg,
                    currentSprite,
                    currentBgmUrl,
                  )
                }
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <History size={14} />{" "}
                <span className="hidden sm:inline">Log</span>
              </button>
              <button
                onClick={() => setIsSkipping(!isSkipping)}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${isSkipping ? "bg-pink-500/30 text-pink-400" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                <FastForward size={14} />{" "}
                <span className="hidden sm:inline">Skip</span>
              </button>
              <button
                onClick={() => {
                  setIsSkipping(false);
                  onOpenOverlay(
                    "save",
                    currentBlock,
                    currentIndex,
                    displayedText,
                    currentBg,
                    currentSprite,
                    currentBgmUrl,
                  );
                }}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <Save size={14} />{" "}
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => {
                  setIsSkipping(false);
                  onOpenOverlay(
                    "load",
                    currentBlock,
                    currentIndex,
                    displayedText,
                    currentBg,
                    currentSprite,
                    currentBgmUrl,
                  );
                }}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <FolderOpen size={14} />{" "}
                <span className="hidden sm:inline">Load</span>
              </button>
              <button
                onClick={() => {
                  setIsSkipping(false);
                  onQuit();
                }}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <LogOut size={14} />{" "}
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>
          </div>

          <div
            onClick={handleBoxClick}
            className={`relative w-full max-w-5xl group ${currentLine?.type !== "choice_selection" ? "pointer-events-auto cursor-pointer" : "pointer-events-none"}`}
          >
            {currentLine.speakerName && (
              <div className="absolute -top-5 left-0 z-50 lg:left-8">
                <div className="border-l-[6px] border-pink-600 bg-white px-8 py-1.5 shadow-lg transform -skew-x-12">
                  <div className="text-base font-bold uppercase tracking-wider text-black transform skew-x-12">
                    {currentLine.speakerName}
                  </div>
                </div>
              </div>
            )}
            <div
              className="relative min-h-40 border-t border-white/10 bg-[#0f131a]/95 p-6 shadow-2xl backdrop-blur-lg lg:min-h-45 lg:p-8"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)",
              }}
            >
              <div className="absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
              <div className="relative z-10 h-full">
                <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-gray-100 drop-shadow-md lg:text-xl">
                  {displayedText}
                  {isTyping && (
                    <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-pink-500 align-sub"></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InGameUI;
