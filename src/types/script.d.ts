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
  nextBlock: string; // Melompat ke blok mana setelah dipilih
  condition?: ChoiceCondition; // Syarat pilihan ini muncul (opsional)
  stateChanges?: StateChange[]; // Efek setelah memilih (opsional)
}

export interface Visuals {
  background?: string;
  sprite?: string; // Gunakan "none" untuk menghapus sprite karakter (karena Makino adalah POV)
  spritePosition?: "left" | "center" | "right";
}

export interface AudioCommand {
  bgm?: string;
  bgmAction?: "play" | "stop";
  sfx?: string;
}

export interface ScriptLine {
  type: "dialogue" | "background" | "choice_selection";
  speakerName?: string;
  text?: string;
  visuals?: Visuals;
  audio?: AudioCommand;
  choices?: ChoiceOption[];
  stateChanges?: StateChange[];
}

export interface ChapterData {
  chapterId: string;
  blocks: Record<string, ScriptLine[]>;
}
export interface SaveSlotData {
  slotId: number;
  date: string;
  chapterUrl: string;
  blockId: string;
  lineIndex: number;
  snippet: string;
  gameStateSnapshot: any;
  savedBg?: string | null;
  savedSprite?: string | null;
  savedBgm?: string | null;
}
