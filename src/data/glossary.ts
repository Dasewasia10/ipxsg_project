export interface GlossaryEntry {
  id: string;
  title: string;
  text: string;
  extra?: string;
  alternatives: string[];
}

export const GLOSSARY_DB: Record<string, GlossaryEntry> = {
  ChronoSync: {
    id: "ChronoSync",
    title: "ChronoSync",
    text: "Alat yang digunakan untuk menstabilkan lompatan waktu.",
    extra: "Masih kurang stabil",
    alternatives: ["jam lintas timeline", "alat lompat waktu"],
  },
  "Consciousness Index": {
    id: "Consciousness Index",
    title: "Consciousness Index",
    text: "Sebuah nilai numerik yang ditampilkan oleh ChronoSync, berfungsi sebagai pengukur stabilitas sebuah *timeline*. Angka yang lebih tinggi (mendekati 1.000) menunjukkan *timeline* yang lebih sesuai dengan *timeline* orisinal, sementara angka yang lebih rendah mengindikasikan ketidakstabilan dan anomali. Semakin banyak angka di belakang koma maka semakin tidak stabil *timeline* tersebut, terlepas setinggi apa nilainya.",
    alternatives: ["CI", "Indeks Kesadaran"],
  },
  Moshikoi: {
    id: "Moshikoi",
    title: "Moshikoi",
    text: "Game simulasi *romance* yang bisa memilih satu dari beberapa skenario alternatif bersama idol pilihan.",
    alternatives: ["Moshimo kimi to koi shitara"],
  },
  Nemophila: {
    id: "Nemophila",
    title: "Nemophila",
    text: 'Bunga kecil dengan kelopak berwarna biru langit cerah dan bagian tengah putih, sering disebut "bunga mata bayi". Bunga ini melambangkan kepolosan dan keindahan yang rapuh.',
    extra: "Bunga kesukaan Mana Nagase.",
    alternatives: ["Bunga Nemophila", "Nemophila Flower"],
  },
  Sacrificial: {
    id: "Sacrificial",
    title: "Sacrificial",
    text: "Kerelaan untuk melepaskan sesuatu yang sangat berharga—baik itu nyawa, hubungan, kehormatan, atau tujuan pribadi—demi kebaikan yang lebih besar atau untuk orang lain.",
    alternatives: ["Pengorbanan"],
  },
  "Shade that Dancing": {
    id: "Shade that Dancing",
    title: "Shade that Dancing",
    text: 'Sebuah anomali yang bisa dilihat Makino dan Mei. Ini adalah "cacat" visual di realitas yang bergerak tidak sinkron.',
    alternatives: ["Bayangan Menari"],
  },
  "Time Jump": {
    id: "Time Jump",
    title: "Time Jump",
    text: "Tindakan berpindah dari satu *timeline* ke *timeline* lain. *Time Jump* ini dapat terjadi secara tidak sengaja (dipicu emosi) atau secara terkendali (dipicu oleh ChronoSync).",
    alternatives: ["Lompatan waktu"],
  },
  Timeline: {
    id: "Timeline",
    title: "Timeline",
    text: "Merujuk pada cabang-cabang realitas yang berbeda.",
    extra:
      "Makino dapat berpindah dari satu *timeline* ke *timeline* lain melalui *jump* yang dipicu oleh ChronoSync atau emosi yang kuat.",
    alternatives: ["Garis waktu"],
  },
  "True Ending": {
    id: "True Ending",
    title: "True Ending",
    text: "Akhir dari awal cerita. Bayaran dari perjuangan sepanjang cerita untuk membuka cerita baru di masa depan.",
    alternatives: ["akhir cerita"],
  },
};
