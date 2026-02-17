export interface StateChange {
  target: string;
  operation: "set" | "add";
  value: any;
}

export interface ChoiceCondition {
  target: string;
  operator: "==" | ">" | ">=" | "<" | "<=";
  value: number;
}

export interface ChoiceOption {
  text: string;
  nextBlock: string;
  condition?: ChoiceCondition;
  stateChanges?: StateChange[];
}

// ---> 1. STRUKTUR BARU UNTUK SPRITE <---
export interface SpriteDef {
  url: string;
  position: "left" | "center" | "right" | "far-left" | "far-right";
  animation?: "none" | "shake" | "bounce" | "fade-in"; // Efek animasi
}

export interface Visuals {
  background?: string;
  sprites?: SpriteDef[] | "clear"; // Array sprite, atau "clear" untuk menghapus semua

  // (Opsional) Tetap pertahankan yang lama sementara waktu agar JSON lamamu tidak error
  sprite?: string;
  spritePosition?: "left" | "center" | "right";
}

export interface AudioCommand {
  bgm?: string;
  bgmAction?: "play" | "stop";
  sfx?: string;
  sfxDelay?: number; // ---> Waktu tunggu sebelum SFX berbunyi (ms) <---
}

export interface ScriptLine {
  type: "dialogue" | "background" | "choice_selection" | "change_chapter";
  speakerName?: string;
  text?: string;
  visuals?: Visuals;
  audio?: AudioCommand;
  choices?: ChoiceOption[];
  stateChanges?: StateChange[];
  nextChapterId?: string;

  // ---> 2. FITUR MANIPULASI DIALOG BARU <---
  forceTextSpeed?: number; // Memaksa kecepatan ketikan (contoh: 100 lambat, 10 cepat)
  autoDelay?: number; // Waktu jeda khusus sebelum lanjut di mode auto (ms)
}

export interface ChapterData {
  chapterId: string;
  title?: string;
  blocks: Record<string, ScriptLine[]>;
}

export interface SaveSlotData {
  slotId: number;
  date: string;
  chapterUrl: string;
  chapterTitle?: string;
  blockId: string;
  lineIndex: number;
  snippet: string;
  gameStateSnapshot: any;
  savedBg?: string | null;
  savedSprites?: SpriteDef[]; // Perbarui save data untuk menampung banyak sprite
  savedBgm?: string | null;
}
