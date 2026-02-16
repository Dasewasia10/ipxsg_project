import { create } from "zustand";

interface SettingsState {
  bgmVolume: number;
  sfxVolume: number;
  textSpeed: number;
  setBgmVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setTextSpeed: (speed: number) => void;
}

// Mengambil data dari localStorage jika ada, jika tidak gunakan default
const loadSettings = () => {
  const saved = localStorage.getItem("ipxsg_settings");
  if (saved) return JSON.parse(saved);
  return { bgmVolume: 80, sfxVolume: 100, textSpeed: 30 };
};

const initialSettings = loadSettings();

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialSettings,
  setBgmVolume: (vol) => {
    set({ bgmVolume: vol });
    localStorage.setItem(
      "ipxsg_settings",
      JSON.stringify({ ...loadSettings(), bgmVolume: vol }),
    );
  },
  setSfxVolume: (vol) => {
    set({ sfxVolume: vol });
    localStorage.setItem(
      "ipxsg_settings",
      JSON.stringify({ ...loadSettings(), sfxVolume: vol }),
    );
  },
  setTextSpeed: (speed) => {
    set({ textSpeed: speed });
    localStorage.setItem(
      "ipxsg_settings",
      JSON.stringify({ ...loadSettings(), textSpeed: speed }),
    );
  },
}));
