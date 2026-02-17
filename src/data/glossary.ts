export interface GlossaryEntry {
  id: string;
  title: { id: string; en: string };
  text: { id: string; en: string };
  extra?: { id: string; en: string };
  alternatives: { id: string[]; en: string[] };
}

export const GLOSSARY_DB: Record<string, GlossaryEntry> = {
  ChronoSync: {
    id: "ChronoSync",
    title: { id: "ChronoSync", en: "ChronoSync" },
    text: {
      id: "Alat yang digunakan untuk menstabilkan lompatan waktu.",
      en: "A device used to stabilize time leaps.",
    },
    extra: {
      id: "Masih kurang stabil",
      en: "Still unstable",
    },
    alternatives: {
      id: ["jam lintas timeline", "alat lompat waktu"],
      en: ["time leap machine", "chronosync device"],
    },
  },
  "Consciousness Index": {
    id: "Consciousness Index",
    title: { id: "Indeks Kesadaran", en: "Consciousness Index" },
    text: {
      id: "Sebuah nilai numerik yang ditampilkan oleh ChronoSync, berfungsi sebagai pengukur stabilitas sebuah timeline. Angka yang lebih tinggi (mendekati 1.000) menunjukkan timeline yang lebih sesuai dengan timeline orisinal, sementara angka yang lebih rendah mengindikasikan ketidakstabilan dan anomali. Semakin banyak angka di belakang koma maka semakin tidak stabil timeline tersebut, terlepas setinggi apa nilainya.",
      en: "A numerical value displayed by ChronoSync, serving as a measure of timeline stability. Higher numbers (approaching 1.000) indicate a timeline more consistent with the original, while lower numbers indicate instability and anomalies. The more decimal places there are, the more unstable the timeline is, regardless of how high the value is.",
    },
    alternatives: {
      id: ["CI", "Indeks Kesadaran"],
      en: ["CI", "Consciousness Index"],
    },
  },
  Moshikoi: {
    id: "Moshikoi",
    title: { id: "Moshikoi", en: "Moshikoi" },
    text: {
      id: "Game simulasi romance yang bisa memilih satu dari beberapa skenario alternatif bersama idol pilihan.",
      en: "A romance simulation game where you can choose one of several alternative scenarios with your chosen idol.",
    },
    alternatives: {
      id: ["Moshimo kimi to koi shitara"],
      en: ["If I fell in love with you"],
    },
  },
  Nemophila: {
    id: "Nemophila",
    title: { id: "Nemophila", en: "Nemophila" },
    text: {
      id: 'Bunga kecil dengan kelopak berwarna biru langit cerah dan bagian tengah putih, sering disebut "bunga mata bayi". Bunga ini melambangkan kepolosan dan keindahan yang rapuh.',
      en: 'A small flower with bright sky-blue petals and a white center, often called "baby blue eyes." This flower symbolizes innocence and fragile beauty.',
    },
    extra: {
      id: "Bunga kesukaan Mana Nagase.",
      en: "Mana Nagase's favorite flower.",
    },
    alternatives: {
      id: ["Bunga Nemophila"],
      en: ["Nemophila Flower"],
    },
  },
  Sacrificial: {
    id: "Sacrificial",
    title: { id: "Pengorbanan", en: "Sacrificial" },
    text: {
      id: "Kerelaan untuk melepaskan sesuatu yang sangat berharga—baik itu nyawa, hubungan, kehormatan, atau tujuan pribadi—demi kebaikan yang lebih besar atau untuk orang lain.",
      en: "The willingness to let go of something very precious—be it life, relationships, honor, or personal goals—for the greater good or for others.",
    },
    alternatives: {
      id: ["Pengorbanan"],
      en: ["Sacrifice"],
    },
  },
  "Shade that Dancing": {
    id: "Shade that Dancing",
    title: { id: "Bayangan Menari", en: "Shade that Dancing" },
    text: {
      id: 'Sebuah anomali yang bisa dilihat Makino dan Mei. Ini adalah "cacat" visual di realitas yang bergerak tidak sinkron.',
      en: 'An anomaly that can be seen by Makino and Mei. It is a visual "glitch" in reality that moves out of sync.',
    },
    alternatives: {
      id: ["Bayangan Menari"],
      en: ["Dancing Shadows"],
    },
  },
  "Time Jump": {
    id: "Time Jump",
    title: { id: "Lompatan Waktu", en: "Time Jump" },
    text: {
      id: "Tindakan berpindah dari satu timeline ke timeline lain. Time Jump ini dapat terjadi secara tidak sengaja (dipicu emosi) atau secara terkendali (dipicu oleh ChronoSync).",
      en: "The act of moving from one timeline to another. This Time Jump can occur accidentally (triggered by emotion) or in a controlled manner (triggered by ChronoSync).",
    },
    alternatives: {
      id: ["Lompatan waktu"],
      en: ["Time leap", "Timeline shift"],
    },
  },
  Timeline: {
    id: "Timeline",
    title: { id: "Garis Waktu", en: "Timeline" },
    text: {
      id: "Merujuk pada cabang-cabang realitas yang berbeda.",
      en: "Refers to different branches of reality.",
    },
    extra: {
      id: "Makino dapat berpindah dari satu timeline ke timeline lain melalui jump yang dipicu oleh ChronoSync atau emosi yang kuat.",
      en: "Makino can move from one timeline to another through jumps triggered by ChronoSync or strong emotions.",
    },
    alternatives: {
      id: ["Garis waktu", "Timeline"],
      en: ["Time stream", "World line"],
    },
  },
  "True Ending": {
    id: "True Ending",
    title: { id: "Akhir Sejati", en: "True Ending" },
    text: {
      id: "Akhir dari awal cerita. Bayaran dari perjuangan sepanjang cerita untuk membuka cerita baru di masa depan.",
      en: "The end of the beginning. The reward for the struggle throughout the story to unlock a new story in the future.",
    },
    alternatives: {
      id: ["Akhir cerita"],
      en: ["The true conclusion"],
    },
  },
};
