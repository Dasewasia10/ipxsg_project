import React, { useState, useEffect } from "react";
import { X, Save, FolderOpen } from "lucide-react";
import type { SaveSlotData } from "../types/script";
import { useGameState } from "../store/useGameState";

interface Props {
  mode: "save" | "load";
  onClose: () => void;
  currentChapterUrl?: string;
  currentBlock?: string;
  currentIndex?: number;
  currentText?: string;
  onLoadGame: (saveData: SaveSlotData) => void;
  currentBg?: string | null;
  currentSprite?: string | null;
  currentBgm?: string | null;
}

const TOTAL_SLOTS = 10;

const SaveLoadOverlay: React.FC<Props> = ({
  mode,
  onClose,
  currentChapterUrl,
  currentBlock,
  currentIndex,
  currentText,
  onLoadGame,
  currentBg,
  currentBgm,
  currentSprite,
}) => {
  const [saves, setSaves] = useState<Record<number, SaveSlotData | null>>({});

  // Menarik data dari localStorage saat modal dibuka
  useEffect(() => {
    const loadedSaves: Record<number, SaveSlotData | null> = {};
    for (let i = 1; i <= TOTAL_SLOTS; i++) {
      const saved = localStorage.getItem(`ipxsg_save_${i}`);
      loadedSaves[i] = saved ? JSON.parse(saved) : null;
    }
    setSaves(loadedSaves);
  }, []);

  const handleSave = (slotId: number) => {
    if (
      mode !== "save" ||
      !currentChapterUrl ||
      !currentBlock ||
      currentIndex === undefined
    )
      return;

    const newSave: SaveSlotData = {
      slotId,
      date: new Date().toLocaleString("id-ID"),
      chapterUrl: currentChapterUrl,
      blockId: currentBlock,
      lineIndex: currentIndex,
      snippet: currentText
        ? currentText.substring(0, 45) + "..."
        : "Tidak ada dialog",
      gameStateSnapshot: useGameState.getState(),
      savedBg: currentBg,
      savedSprite: currentSprite,
      savedBgm: currentBgm,
    };

    localStorage.setItem(`ipxsg_save_${slotId}`, JSON.stringify(newSave));
    setSaves((prev) => ({ ...prev, [slotId]: newSave }));
  };

  const handleLoad = (slotId: number) => {
    const data = saves[slotId];
    if (data && mode === "load") {
      onLoadGame(data);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-4xl h-[80vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            {mode === "save" ? (
              <>
                <Save className="text-pink-400" /> Simpan Progress
              </>
            ) : (
              <>
                <FolderOpen className="text-pink-400" /> Muat Progress
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        {/* Daftar Slot Save */}
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1).map((slot) => {
            const data = saves[slot];
            return (
              <button
                key={slot}
                onClick={() =>
                  mode === "save" ? handleSave(slot) : handleLoad(slot)
                }
                disabled={mode === "load" && !data}
                className={`relative flex flex-col gap-2 border p-4 text-left transition-all hover:scale-105 ${
                  mode === "load" && !data
                    ? "cursor-not-allowed border-white/5 bg-white/5 opacity-50"
                    : "border-white/20 bg-[#151921] hover:border-pink-500 hover:bg-pink-500/10"
                }`}
              >
                <div className="flex justify-between border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wider text-pink-500">
                  <span>Slot {String(slot).padStart(2, "0")}</span>
                  {data && <span className="text-gray-400">{data.date}</span>}
                </div>

                {data ? (
                  <p className="mt-2 text-sm italic text-gray-200">
                    "{data.snippet}"
                  </p>
                ) : (
                  <p className="mt-2 py-4 text-center text-sm font-bold uppercase tracking-widest text-gray-600">
                    Data Kosong
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadOverlay;
