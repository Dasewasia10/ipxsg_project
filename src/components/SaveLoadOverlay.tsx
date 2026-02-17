import React, { useState, useEffect } from "react";
import { X, Save, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
import type { SaveSlotData } from "../types/script";
import { useGameState } from "../store/useGameState";

import { useLanguageStore } from "../store/useLanguageStore";
import { UI_TEXT } from "../data/uiTranslations";

interface Props {
  mode: "save" | "load";
  inGame: boolean; // Prop baru untuk mengecek apakah sedang main atau di main menu
  onClose: () => void;
  currentChapterUrl?: string;
  currentChapterTitle?: string;
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
  inGame,
  onClose,
  currentChapterUrl,
  currentChapterTitle,
  currentBlock,
  currentIndex,
  currentText,
  onLoadGame,
  currentBg,
  currentBgm,
  currentSprite,
}) => {
  const [saves, setSaves] = useState<Record<number, SaveSlotData | null>>({});

  // State untuk modal konfirmasi
  const [confirmDialog, setConfirmDialog] = useState<{
    action: "save" | "load" | "delete";
    slot: number;
  } | null>(null);

  const { language } = useLanguageStore();
  const t = UI_TEXT[language];

  useEffect(() => {
    const loadedSaves: Record<number, SaveSlotData | null> = {};
    for (let i = 1; i <= TOTAL_SLOTS; i++) {
      const saved = localStorage.getItem(`ipxsg_save_${i}`);
      loadedSaves[i] = saved ? JSON.parse(saved) : null;
    }
    setSaves(loadedSaves);
  }, []);

  const executeSave = (slotId: number) => {
    if (!currentChapterUrl || !currentBlock || currentIndex === undefined)
      return;
    const newSave: SaveSlotData = {
      slotId,
      date: new Date().toLocaleString("id-ID"),
      chapterUrl: currentChapterUrl,
      chapterTitle: currentChapterTitle || "Chapter Tanpa Judul",
      blockId: currentBlock,
      lineIndex: currentIndex,
      snippet: currentText
        ? currentText.substring(0, 45) + "..."
        : "Tidak ada dialog",
      savedBg: currentBg,
      savedSprite: currentSprite,
      savedBgm: currentBgm,
      gameStateSnapshot: useGameState.getState(),
    };
    localStorage.setItem(`ipxsg_save_${slotId}`, JSON.stringify(newSave));
    setSaves((prev) => ({ ...prev, [slotId]: newSave }));
    setConfirmDialog(null);
  };

  const executeLoad = (slotId: number) => {
    const data = saves[slotId];
    if (data) onLoadGame(data);
    setConfirmDialog(null);
  };

  const executeDelete = (slotId: number) => {
    localStorage.removeItem(`ipxsg_save_${slotId}`);
    setSaves((prev) => ({ ...prev, [slotId]: null }));
    setConfirmDialog(null);
  };

  const handleSlotClick = (slotId: number) => {
    const hasData = !!saves[slotId];
    if (mode === "save") {
      if (hasData)
        setConfirmDialog({ action: "save", slot: slotId }); // Peringatan overwrite
      else executeSave(slotId);
    } else if (mode === "load" && hasData) {
      if (inGame)
        setConfirmDialog({ action: "load", slot: slotId }); // Peringatan unsaved saat in-game
      else executeLoad(slotId);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative flex w-full max-w-5xl h-[85vh] flex-col bg-[#0f1115] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
          <h2 className="flex items-center gap-3 text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-500">
            {mode === "save" ? (
              <>
                <Save className="text-pink-400" /> {t.overlays.saveTitle}
              </>
            ) : (
              <>
                <FolderOpen className="text-pink-400" /> {t.overlays.loadTitle}
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
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 lg:grid-cols-2 relative">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1).map((slot) => {
            const data = saves[slot];
            return (
              <div
                key={slot}
                className="relative group flex items-stretch gap-4 border border-white/20 bg-[#151921] p-3 text-left transition-all hover:border-pink-500"
              >
                <button
                  onClick={() => handleSlotClick(slot)}
                  disabled={mode === "load" && !data}
                  className={`flex flex-1 items-stretch gap-4 text-left ${mode === "load" && !data ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="relative flex w-32 shrink-0 flex-col justify-end overflow-hidden border border-white/10 bg-black">
                    {data?.savedBg ? (
                      <img
                        src={data.savedBg}
                        className="absolute inset-0 h-full w-full object-cover opacity-80"
                        alt="bg"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-700">
                        NO DATA
                      </div>
                    )}
                    {data?.savedSprite && (
                      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
                        <img
                          src={data.savedSprite}
                          className="h-full object-contain translate-y-2"
                          alt="sprite"
                        />
                      </div>
                    )}
                    {data && (
                      <div
                        className="relative z-10 w-full border-t border-white/20 bg-[#0f131a]/90 px-1.5 py-1 mt-auto min-h-6"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)",
                        }}
                      >
                        <p className="text-[2px] leading-tight text-gray-200 line-clamp-2">
                          {data.snippet}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex justify-between border-b border-white/10 pb-1 text-[11px] font-bold uppercase tracking-wider text-pink-500">
                      <span>Slot {String(slot).padStart(2, "0")}</span>
                      {data && (
                        <span className="text-gray-400">{data.date}</span>
                      )}
                    </div>
                    {data ? (
                      <div className="mt-2 flex-1">
                        <p className="text-xs font-bold text-blue-300 line-clamp-1">
                          {data.chapterTitle}
                        </p>
                        <p className="mt-1 text-xs italic text-gray-300 line-clamp-2">
                          "{data.snippet}"
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-1 items-center justify-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                          {t.overlays.emptySlot}
                        </p>
                      </div>
                    )}
                  </div>
                </button>

                {/* Tombol Hapus */}
                {data && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDialog({ action: "delete", slot });
                    }}
                    className="absolute right-2 bottom-2 p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/20 rounded z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Konfirmasi Menimpa/Load/Hapus */}
      {confirmDialog && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151921] border border-white/20 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="flex items-center gap-2 text-lg font-bold uppercase text-yellow-400 mb-2">
              <AlertTriangle size={20} /> {t.overlays.saveloadWarning}
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              {confirmDialog.action === "save" && t.overlays.overwriteWarning}
              {confirmDialog.action === "load" && t.overlays.unsavedWarning}
              {confirmDialog.action === "delete" && t.overlays.deleteWarning}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white"
              >
                {t.overlays.no}
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.action === "save")
                    executeSave(confirmDialog.slot);
                  if (confirmDialog.action === "load")
                    executeLoad(confirmDialog.slot);
                  if (confirmDialog.action === "delete")
                    executeDelete(confirmDialog.slot);
                }}
                className="px-4 py-2 text-xs font-bold uppercase bg-pink-600 hover:bg-pink-500 text-white rounded"
              >
                {t.overlays.yesContinue}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SaveLoadOverlay;
