import { create } from "zustand";

interface GlossaryState {
  unlockedTips: string[];
  unlockTip: (tipId: string) => void;
}

// Baca dari localStorage saat pertama kali dimuat
const loadTips = (): string[] => {
  const saved = localStorage.getItem("ipxsg_unlocked_tips");
  return saved ? JSON.parse(saved) : [];
};

export const useGlossaryStore = create<GlossaryState>((set) => ({
  unlockedTips: loadTips(),
  unlockTip: (tipId) =>
    set((state) => {
      // Jika belum ada, tambahkan dan simpan permanen ke localStorage
      if (!state.unlockedTips.includes(tipId)) {
        const newTips = [...state.unlockedTips, tipId];
        localStorage.setItem("ipxsg_unlocked_tips", JSON.stringify(newTips));
        return { unlockedTips: newTips };
      }
      return state;
    }),
}));
