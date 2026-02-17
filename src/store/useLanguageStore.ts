import { create } from "zustand";

type Language = "id" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (localStorage.getItem("ipxsg_language") as Language) || "id",
  setLanguage: (lang) => {
    localStorage.setItem("ipxsg_language", lang);
    set({ language: lang });
  },
}));
