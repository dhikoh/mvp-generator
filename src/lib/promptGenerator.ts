export interface PromptConfig {
  channelName: string;
  niche: string;
  visualAesthetic: string;
  pov: string;
  title?: string;
  requestTitles: boolean;
  excludedTitles?: string[];
  topic: string;
  targetPlatform: string;
  includeHook: boolean;
  includeCta: boolean;
  includeCaption: boolean;
  includeThumbnail: boolean;
  aspectRatio: string;
  duration: number;
  speakingRate: number;
  hookStyle: string;
  endingStyle: string;
  compEdu: number;
  compEnt: number;
  compMark: number;
  includeHtml: boolean;
}

export function generateMasterPrompt(config: PromptConfig): string {
  const wordCount = Math.floor(config.duration * config.speakingRate);

  let prompt = `Anda adalah seorang AI Content Creator Specialist tingkat dunia.
Tugas Anda adalah membuat naskah video pendek berkualitas tinggi berdasarkan konfigurasi berikut.
Anda WAJIB memberikan respons HANYA DALAM FORMAT JSON YANG VALID tanpa teks pengantar atau penutup.

=== KONFIGURASI CHANNEL ===
- Nama Channel: ${config.channelName}
- Niche: ${config.niche}
- Estetika Visual: ${config.visualAesthetic}
- POV/Persona: ${config.pov}

=== PARAMETER VIDEO ===
- Topik/Ide: ${config.topic}
- Target Platform: ${config.targetPlatform}
- Aspect Ratio: ${config.aspectRatio}
- Estimasi Durasi: ${config.duration} detik
- Laju Bicara: ${config.speakingRate} kata/detik (Target: ~${wordCount} kata)
- Hook Style: ${config.hookStyle}
- Ending Style: ${config.endingStyle}
- Komposisi Naskah: Edukasi (${config.compEdu}%), Hiburan (${config.compEnt}%), Marketing (${config.compMark}%)
`;

  if (config.requestTitles) {
    prompt += `- Berikan 10 opsi judul yang sangat clickbait dan relevan.\n`;
    if (config.excludedTitles && config.excludedTitles.length > 0) {
      prompt += `- PENTING: JANGAN gunakan atau mengulangi judul-judul berikut ini karena sudah pernah digunakan sebelumnya:\n  * ${config.excludedTitles.join('\n  * ')}\n`;
    }
  } else {
    prompt += `- Judul Konten: ${config.title}\n`;
  }

  prompt += `
=== STRUKTUR SCENE ===
Pecah naskah menjadi beberapa scene (Scene 1, Scene 2, dst).
Setiap scene harus mencakup:
- "visual": Deskripsi detail apa yang terlihat di layar (sesuaikan dengan estetika visual).
- "audio": Arahan sound effect (SFX) atau Background Music (BGM).
- "narasi": Teks yang diucapkan (Voice Over).
- "durasi_estimasi": Estimasi durasi scene ini (dalam detik).

=== FORMAT JSON YANG DIWAJIBKAN ===
{
  "judul_konten": "${config.requestTitles ? "Array of 10 strings" : "String judul utama"}",
  "caption_medsos": "${config.includeCaption ? "Teks caption beserta hashtag" : ""}",
  "ide_thumbnail": "${config.includeThumbnail ? "Deskripsi visual thumbnail yang menarik" : ""}",
  "html_blog": "${config.includeHtml ? "Teks artikel HTML (<h2>...</h2><p>...</p>) berdasarkan isi video" : ""}",
  "scenes": [
    {
      "tipe": "${config.includeHook ? "hook" : "content"}",
      "visual": "...",
      "audio": "...",
      "narasi": "...",
      "durasi_estimasi": 5
    },
    ... (tambahkan scene lain sesuai durasi dan alur konten) ...,
    {
      "tipe": "${config.includeCta ? "cta" : "content"}",
      "visual": "...",
      "audio": "...",
      "narasi": "...",
      "durasi_estimasi": 5
    }
  ]
}

PERINGATAN: 
1. Jangan sertakan \`\`\`json atau markdown apapun. Output harus murni JSON text yang bisa di-parse.
2. Pastikan properti JSON menggunakan double quotes (").
3. Naskah harus mengalir natural dengan persona ${config.pov} dan gaya transisi akhir ${config.endingStyle}.
`;

  return prompt;
}
