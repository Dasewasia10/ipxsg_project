import { create } from "zustand";

// Mendefinisikan struktur data dari Global State
interface GameState {
  // 1. Core Timeline & Mental State
  consciousIndex: number; // Dimulai dari 1.000 (Original Timeline)
  makinoSanity: number; // Skala 0 - 100

  // 2. Key Items
  hasChronoSync: boolean;

  // 3. Trust Levels (Skala 0 - 100)
  trustMei: number;
  trustShizuku: number;
  trustMiho: number;

  // 4. Awareness Levels (Skala 0 - 100)
  manaAwareness: number;
  rioAwareness: number;

  // 5. Health Conditions (Skala 0 - 100, atau bisa diubah menjadi enum statis jika perlu)
  healthYou: number;
  healthSakura: number;

  // --- ACTIONS (Fungsi untuk mengubah state) ---
  setConsciousIndex: (newCI: number) => void;
  decreaseSanity: (amount: number) => void;
  toggleChronoSync: (status: boolean) => void;
  updateTrust: (character: "Mei" | "Shizuku" | "Miho", amount: number) => void;
  updateAwareness: (character: "Mana" | "Rio", amount: number) => void;
  updateHealth: (character: "You" | "Sakura", amount: number) => void;

  // Fungsi utilitas untuk reset saat New Game
  resetGame: () => void;
}

// Nilai awal (Start of the Game)
const initialState = {
  consciousIndex: 1.0,
  makinoSanity: 100,
  hasChronoSync: false,
  trustMei: 50, // Nilai netral awal
  trustShizuku: 50,
  trustMiho: 30,
  manaAwareness: 0, // Belum sadar di awal
  rioAwareness: 0,
  healthYou: 100, // Asumsi sehat di awal cerita
  healthSakura: 100,
};

// Membuat Store Zustand
export const useGameState = create<GameState>((set) => ({
  ...initialState,

  // Implementasi Actions
  setConsciousIndex: (newCI) => set(() => ({ consciousIndex: newCI })),

  decreaseSanity: (amount) =>
    set((state) => ({
      makinoSanity: Math.max(0, state.makinoSanity - amount),
    })),

  toggleChronoSync: (status) => set(() => ({ hasChronoSync: status })),

  updateTrust: (character, amount) =>
    set((state) => {
      const key = `trust${character}` as keyof GameState;
      return {
        [key]: Math.min(100, Math.max(0, (state[key] as number) + amount)),
      };
    }),

  updateAwareness: (character, amount) =>
    set((state) => {
      const key = `${character.toLowerCase()}Awareness` as keyof GameState;
      return {
        [key]: Math.min(100, Math.max(0, (state[key] as number) + amount)),
      };
    }),

  updateHealth: (character, amount) =>
    set((state) => {
      const key = `health${character}` as keyof GameState;
      return {
        [key]: Math.min(100, Math.max(0, (state[key] as number) + amount)),
      };
    }),

  resetGame: () => set(initialState),
}));
