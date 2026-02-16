import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  FastForward,
  Save,
  FolderOpen,
  LogOut,
  History,
  Bug,
  Settings,
  BookOpen,
} from "lucide-react";
import type {
  //   ScriptLine,
  ChapterData,
  StateChange,
  ChoiceCondition,
  ChoiceOption,
} from "../types/script";
import { useGameState } from "../store/useGameState";
import { useSettingsStore } from "../store/useSettingsStore";
import { useGlossaryStore } from "../store/useGlossaryStore";

import LogOverlay from "./LogOverlay";
import type { LogEntry } from "./LogOverlay";

import { GLOSSARY_DB } from "../data/glossary";
import TipsOverlay from "./TipsOverlay";

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
  onChangeChapter: (url: string) => void;
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
  onChangeChapter,
}) => {
  const [currentBlock, setCurrentBlock] = useState<string>(initialBlock);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const [history, setHistory] = useState<LogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const [showChoices, setShowChoices] = useState(false);

  // STATE VISUAL & AUDIO (Diisi dengan initial data dari Save Game)
  const [currentBg, setCurrentBg] = useState<string | null>(initialBg);
  const [currentSprite, setCurrentSprite] = useState<string | null>(
    initialSprite,
  );
  const [currentBgmUrl, setCurrentBgmUrl] = useState<string | null>(initialBgm);

  // --- STATE SETTINGS ---
  const { bgmVolume, textSpeed } = useSettingsStore();

  // --- STATE KONFIRMASI KE MAIN MENU
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // --- STATE TITLE SHOWN
  const [showTitle, setShowTitle] = useState(false);

  // --- STATE TIPS NOTIFICATION SHOWN
  const [newTipNotification, setNewTipNotification] = useState<string | null>(
    null,
  );

  const typeIntervalRef = useRef<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const activeScript = chapterData.blocks[currentBlock] || [];
  const currentLine = activeScript[currentIndex];

  const gameState = useGameState();

  // ==========================================
  // LOGIKA AUDIO LOAD & VOLUME
  // ==========================================
  useEffect(() => {
    if (initialBgm) {
      bgmRef.current = new Audio(initialBgm);
      bgmRef.current.loop = true;
      bgmRef.current.volume = bgmVolume / 100; // <--- Set Volume dari pengaturan
      bgmRef.current
        .play()
        .catch((e) => console.warn("Browser mencegah autoplay", e));
    }
    return () => {
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, [initialBgm]);

  // Pantau perubahan volume secara real-time dari menu setting
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume / 100;
    }
  }, [bgmVolume]);

  // ==========================================
  // EFEK SLIDE-IN JUDUL CHAPTER
  // ==========================================
  useEffect(() => {
    // Setiap kali chapterData.title berubah (artinya file baru di-load), nyalakan animasi
    if (chapterData.title) {
      setShowTitle(true);
      const timer = setTimeout(() => setShowTitle(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [chapterData.title]);

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
      setShowChoices(false);
    } else {
      onQuit();
    }
  };

  const handleBoxClick = () => {
    // HANYA blokir klik JIKA ada choice DAN teksnya sudah selesai diketik
    if (currentLine?.type === "choice_selection" && !isTyping) return;

    if (isSkipping) setIsSkipping(false);
    if (isAutoPlay) setIsAutoPlay(false);

    if (isTyping) {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      setDisplayedText(currentLine?.text || "");
      setIsTyping(false);

      // Jika yang diklik paksa ini ternyata adalah choice, langsung munculkan tombolnya
      if (currentLine?.type === "choice_selection") {
        setShowChoices(true);
      }
    } else {
      advance();
    }
  };

  const handleChoiceClick = (choice: ChoiceOption) => {
    executeStateChanges(choice.stateChanges);
    setCurrentBlock(choice.nextBlock);
    setCurrentIndex(0);
    setIsSkipping(false);
    setShowChoices(false);
  };

  // ==========================================
  // LOGIKA AUTO PLAY
  // ==========================================
  useEffect(() => {
    let autoTimer: number;

    // Jika sedang tidak mengetik, mode Auto nyala, dan BUKAN sedang di layar pilihan
    if (!isTyping && isAutoPlay && currentLine?.type !== "choice_selection") {
      // Waktu tunggu (delay) sebelum lanjut.
      // Bisa dibuat dinamis berdasarkan panjang teks, tapi 1500ms adalah standar yang nyaman.
      autoTimer = window.setTimeout(() => {
        advance();
      }, 1500);
    }

    return () => clearTimeout(autoTimer);
  }, [isTyping, isAutoPlay, currentLine, currentIndex, currentBlock]);

  // ==========================================
  // EFEK BARIS BARU
  // ==========================================
  useEffect(() => {
    if (!currentLine) return;

    // ---> LOGIKA PERPINDAHAN CHAPTER <---
    if (currentLine.type === "change_chapter" && currentLine.nextChapterUrl) {
      onChangeChapter(currentLine.nextChapterUrl);
      return; // Hentikan eksekusi efek lainnya di baris ini
    }

    executeStateChanges(currentLine.stateChanges);

    // 2. Proses Visual (Update Background & Sprite)
    if (currentLine.visuals?.background) {
      setCurrentBg(currentLine.visuals.background);

      // ---> LOGIKA UNLOCK CG <---
      // Jika background adalah gambar dari folder /cg/, simpan ke localStorage
      if (currentLine.visuals.background.includes("/cg/")) {
        const savedCgs = localStorage.getItem("ipxsg_unlocked_cgs");
        const cgsArray: string[] = savedCgs ? JSON.parse(savedCgs) : [];
        if (!cgsArray.includes(currentLine.visuals.background)) {
          cgsArray.push(currentLine.visuals.background);
          localStorage.setItem("ipxsg_unlocked_cgs", JSON.stringify(cgsArray));
        }
      }
    }
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
        bgmRef.current.volume = bgmVolume / 100;
        bgmRef.current.play().catch((e) => console.warn(e));
      }
    }

    if (currentLine.text) {
      setHistory((prev) => {
        // Mencegah duplikasi log karena React Strict Mode
        if (
          prev.length > 0 &&
          prev[prev.length - 1].block === currentBlock &&
          prev[prev.length - 1].index === currentIndex
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            block: currentBlock,
            index: currentIndex,
            speaker: currentLine.speakerName,
            text: currentLine.text!,
          },
        ];
      });

      // ---> LOGIKA DETEKSI GLOSSARY BARU <---
      const currentUnlocked = useGlossaryStore.getState().unlockedTips;
      let newlyUnlocked: string | null = null;

      Object.values(GLOSSARY_DB).forEach((term) => {
        if (currentUnlocked.includes(term.id)) return; // Lewati jika sudah terbuka

        const allWords = [term.title, ...term.alternatives];
        const hasMatch = allWords.some(
          (word) => new RegExp(`\\b${word}\\b`, "i").test(currentLine.text!), // Cari kata persis
        );

        if (hasMatch) {
          useGlossaryStore.getState().unlockTip(term.id);
          newlyUnlocked = term.title;
        }
      });

      // Jika menemukan kata baru, munculkan toast notifikasi
      if (newlyUnlocked) {
        setNewTipNotification(newlyUnlocked);
        setTimeout(() => setNewTipNotification(null), 4000); // Hilang dalam 4 detik
      }

      setIsTyping(true);
      setDisplayedText("");
      let charIndex = 0;
      const fullText = currentLine.text;

      if (isSkipping) {
        setDisplayedText(fullText);
        setIsTyping(false);

        // HENTIKAN SKIP JIKA ADA PILIHAN
        if (currentLine.type === "choice_selection") {
          setShowChoices(true);
          setIsSkipping(false);
          setIsAutoPlay(false);
        } else {
          const skipTimer = setTimeout(() => advance(), 100);
          return () => clearTimeout(skipTimer);
        }
      }

      typeIntervalRef.current = window.setInterval(() => {
        charIndex++;
        setDisplayedText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setIsTyping(false);

          if (currentLine.type === "choice_selection") {
            // Beri jeda 500ms agar pemain mencerna teks sebelum tombol muncul
            setTimeout(() => {
              setShowChoices(true);
            }, 500);

            // Matikan Auto Play agar mesin tidak lompat sendiri
            setIsAutoPlay(false);
          }
        }
      }, textSpeed);
    } else {
      setIsTyping(false);
      setDisplayedText("");
      if (currentLine.type === "background") advance();
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [currentIndex, currentBlock, isSkipping]);

  // Fungsi untuk menyulap kata biasa menjadi Highlight Glossary
  const renderTextWithGlossary = (text: string) => {
    // Jika masih mengetik, kembalikan teks biasa agar typewriter tidak rusak
    if (isTyping) return text;

    let parsedElements: (string | React.JSX.Element)[] = [text];

    const unlockedTips = useGlossaryStore.getState().unlockedTips;

    // Cek hanya kata-kata yang sudah terbuka
    unlockedTips.forEach((tipId) => {
      const term = GLOSSARY_DB[tipId];
      if (!term) return;

      const wordsToHighlight = [term.title, ...term.alternatives];

      wordsToHighlight.forEach((word) => {
        // Gunakan regex untuk mencari kata secara spesifik (case-insensitive)
        const regex = new RegExp(`(\\b${word}\\b)`, "gi");

        parsedElements = parsedElements.flatMap((el, i) => {
          if (typeof el !== "string") return el; // Abaikan yang sudah jadi JSX

          const parts = el.split(regex);
          return parts.map((part, j) => {
            if (part.toLowerCase() === word.toLowerCase()) {
              return (
                <span
                  key={`${i}-${j}`}
                  // Hanya highlight kuning dengan garis bawah putus-putus
                  className="text-yellow-400 border-b border-dashed border-yellow-400/50"
                >
                  {part}
                </span>
              );
            }
            return part;
          });
        });
      });
    });

    return parsedElements;
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black selection:bg-pink-500">
      {/* JUDUL CHAPTER ANIMASI SLIDE-IN */}
      <div
        className={`absolute top-6 left-6 z-50 flex items-center bg-[#0f131a]/90 backdrop-blur-md border-l-[6px] border-pink-600 px-6 py-2.5 shadow-2xl transition-transform duration-500 ease-out transform -skew-x-12 ${showTitle ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        <div className="transform skew-x-12 flex flex-col">
          <span className="text-gray-400 font-bold tracking-wider text-[10px] uppercase">
            Current Chapter
          </span>
          <span className="text-lg lg:text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            {chapterData.title}
          </span>
        </div>
      </div>

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

      {currentLine?.type === "choice_selection" && !isTyping && showChoices && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-4 backdrop-blur-none">
          <div className="flex w-3/4 lg:w-full max-w-2xl flex-col gap-4 animate-in slide-in-from-bottom-10 -translate-y-10">
            {currentLine.choices
              ?.filter((c) => isConditionMet(c.condition))
              .map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoiceClick(choice)}
                  className="group relative border border-white/20 bg-[#0f131a]/90 px-4 py-2 lg:px-8 lg:py-4 shadow-lg transition-all duration-300 hover:border-pink-500 transform -skew-x-6"
                >
                  <div className="absolute inset-0 w-1 -translate-x-full bg-pink-500 transition-transform duration-300 group-hover:translate-x-0" />
                  <span className="block text-center text-sm lg:text-lg font-medium tracking-wide text-gray-200 group-hover:text-white transform skew-x-6">
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
          {/* PANEL DEBUGGER */}
          {showDebug && (
            <div className="absolute left-4 bottom-125 lg:bottom-80 w-72 bg-black/90 border border-red-500/50 p-4 text-xs font-mono text-green-400 shadow-2xl rounded-md pointer-events-none backdrop-blur-md z-100">
              <h3 className="text-red-400 font-bold border-b border-red-500/30 pb-2 mb-2 uppercase">
                Engine DevTools
              </h3>
              <p>
                Block : <span className="text-white">{currentBlock}</span>
              </p>
              <p>
                Index : <span className="text-white">{currentIndex}</span>
              </p>
              <div className="h-px w-full bg-red-500/30 my-2"></div>
              <p>
                CI Index :{" "}
                <span className="text-yellow-300">
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 6,
                  }).format(gameState.consciousIndex)}
                </span>
              </p>
              <p>
                Sanity :{" "}
                <span
                  className={
                    gameState.makinoSanity < 50 ? "text-red-500" : "text-white"
                  }
                >
                  {gameState.makinoSanity} / 100
                </span>
              </p>
              <p>
                Tr. Mei :{" "}
                <span className="text-white">{gameState.trustMei}</span>
              </p>
              <p>
                Aw. Mana :{" "}
                <span className="text-white">{gameState.manaAwareness}</span>
              </p>
            </div>
          )}
          {/* ---> QUICK MENU VERTIKAL <--- */}
          <div className="absolute bottom-[105%] right-4 lg:right-10 z-50 pointer-events-auto mb-2">
            <div className="flex flex-col items-end gap-1 rounded-xl border border-white/10 bg-black/60 p-2 shadow-lg backdrop-blur-md">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className={`flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${showDebug ? "bg-red-500/30 text-red-400" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                <Bug size={16} className="shrink-0" />
                <span className="hidden sm:inline">Debug</span>
              </button>

              <button
                onClick={() => setShowLog(true)}
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <History size={16} className="shrink-0" />
                <span className="hidden sm:inline">Log</span>
              </button>

              <button
                onClick={() => setShowTips(true)}
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <BookOpen size={16} className="shrink-0" />
                <span className="hidden sm:inline">Glossarium</span>
              </button>

              <button
                onClick={() => {
                  setIsAutoPlay(!isAutoPlay);
                  if (!isAutoPlay) setIsSkipping(false);
                }}
                className={`flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isAutoPlay ? "bg-blue-500/30 text-blue-400" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                <Play size={16} className="shrink-0" />
                <span className="hidden sm:inline">Auto</span>
              </button>

              <button
                onClick={() => {
                  setIsSkipping(!isSkipping);
                  if (!isSkipping) setIsAutoPlay(false);
                }}
                className={`flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isSkipping ? "bg-pink-500/30 text-pink-400" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                <FastForward size={16} className="shrink-0" />
                <span className="hidden sm:inline">Skip</span>
              </button>

              <button
                onClick={() => {
                  setIsSkipping(false);
                  setIsAutoPlay(false);
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
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <Save size={16} className="shrink-0" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={() => {
                  setIsSkipping(false);
                  setIsAutoPlay(false);
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
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <FolderOpen size={16} className="shrink-0" />
                <span className="hidden sm:inline">Load</span>
              </button>

              <button
                onClick={() => {
                  setIsSkipping(false);
                  setIsAutoPlay(false);
                  onOpenOverlay(
                    "options",
                    currentBlock,
                    currentIndex,
                    displayedText,
                    currentBg,
                    currentSprite,
                    currentBgmUrl,
                  );
                }}
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <Settings size={16} className="shrink-0" />
                <span className="hidden sm:inline">Options</span>
              </button>

              <button
                onClick={() => {
                  setIsSkipping(false);
                  setIsAutoPlay(false);
                  setShowQuitConfirm(true);
                }}
                className="flex items-center justify-start gap-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <LogOut size={16} className="shrink-0" />
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
                  <div className="text-sm lg:text-base font-bold uppercase tracking-wider text-black transform skew-x-12">
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
                <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-gray-100 drop-shadow-md lg:text-xl">
                  {renderTextWithGlossary(displayedText)}
                  {isTyping && (
                    <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-pink-500 align-sub"></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLog && (
        <LogOverlay history={history} onClose={() => setShowLog(false)} />
      )}

      {showTips && <TipsOverlay onClose={() => setShowTips(false)} />}

      {/* Peringatan Quit ke Menu */}
      {showQuitConfirm && (
        <div className="absolute inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#151921] border border-white/20 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold uppercase text-yellow-400 mb-2">
              Kembali ke Menu Utama?
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Progres kamu yang belum di-save akan hilang.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={onQuit}
                className="px-4 py-2 text-xs font-bold uppercase bg-pink-600 hover:bg-pink-500 text-white rounded"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI TIPS BARU */}
      <div
        className={`absolute top-20 right-6 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-yellow-500/30 px-4 py-3 shadow-2xl transition-all duration-500 ease-out transform ${newTipNotification ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        <BookOpen className="text-yellow-400" size={20} />
        <div className="flex flex-col">
          <span className="text-gray-400 font-bold tracking-wider text-[8px] uppercase">
            GLOSSARIUM Unlocked
          </span>
          <span className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            {newTipNotification}
          </span>
        </div>
      </div>
    </div>
  );
};
export default InGameUI;
