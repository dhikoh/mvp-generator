"use client";

import { useState } from "react";

export default function DraftsClient() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleParse = () => {
    setError('');
    try {
      if (!jsonInput.trim()) {
        throw new Error("Masukkan JSON hasil dari AI terlebih dahulu.");
      }

      // Try to clean up the JSON string just in case the AI added markdown backticks
      let cleanJson = jsonInput;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
      }

      const parsed = JSON.parse(cleanJson);
      
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        throw new Error("JSON tidak valid: properti 'scenes' tidak ditemukan atau bukan array.");
      }

      setParsedData(parsed);
    } catch (err: any) {
      setError(err.message || "Gagal melakukan parsing JSON. Pastikan format sudah benar.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Parser Panel */}
      <div className="glass-panel p-6 rounded-3xl lg:col-span-1 space-y-4 h-fit">
        <h3 className="font-bold border-b border-[var(--text-secondary)] pb-2">AI JSON Parser</h3>
        <p className="text-xs text-[var(--text-secondary)]">Paste hasil (JSON) yang diberikan oleh AI eksternal (Gemini, Claude, GPT) ke dalam kotak ini.</p>
        
        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/30">
            {error}
          </div>
        )}

        <textarea 
          rows={10} 
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          placeholder='{"judul_konten": "...", "scenes": [ ... ]}' 
          className="w-full p-3 rounded-xl neu-pressed border-none outline-none text-xs bg-transparent font-mono"
        />
        <button 
          onClick={handleParse}
          className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-xl neu-flat hover:opacity-90 transition active:scale-95"
        >
          ⚙️ Ekstrak & Pecah Scene
        </button>
      </div>

      {/* Scene List Editor */}
      <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
        <h3 className="font-bold border-b border-[var(--text-secondary)] pb-2">Editor Naskah per Scene</h3>
        
        {parsedData ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Judul Konten</label>
              {Array.isArray(parsedData.judul_konten) ? (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {parsedData.judul_konten.map((j: string, i: number) => <li key={i}>{j}</li>)}
                </ul>
              ) : (
                <p className="text-sm font-semibold">{parsedData.judul_konten || '-'}</p>
              )}
            </div>

            {parsedData.caption_medsos && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Caption / Hashtag</label>
                <p className="text-sm whitespace-pre-wrap">{parsedData.caption_medsos}</p>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <label className="text-sm font-bold border-b border-[var(--text-secondary)]/50 pb-1 block">Daftar Scene ({parsedData.scenes.length})</label>
              {parsedData.scenes.map((scene: any, index: number) => (
                <div key={index} className="neu-flat p-4 rounded-xl relative hover:border-[var(--accent)]/30 border border-transparent transition">
                  <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded capitalize">
                    {scene.tipe || 'Scene'} {index + 1}
                  </div>
                  
                  <div className="space-y-4 pr-16">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--accent)] uppercase mb-1">👀 Visual / Video</label>
                      <p className="text-sm font-medium">{scene.visual}</p>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-orange-500 uppercase mb-1">🎵 Audio (SFX/BGM)</label>
                      <p className="text-sm font-medium">{scene.audio}</p>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-green-500 uppercase mb-1">🎤 Narasi / Voice Over ({scene.durasi_estimasi}s)</label>
                      <textarea 
                        rows={2} 
                        value={scene.narasi} 
                        onChange={(e) => {
                          const newData = { ...parsedData };
                          newData.scenes[index].narasi = e.target.value;
                          setParsedData(newData);
                        }}
                        className="w-full p-3 rounded-lg neu-pressed border-none outline-none text-sm bg-transparent font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--text-secondary)] space-x-3">
               <button 
                 onClick={() => { setParsedData(null); setJsonInput(''); }}
                 className="px-4 py-2 bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] text-sm font-bold rounded-xl hover:bg-[var(--text-secondary)] hover:text-white transition"
               >
                 Reset
               </button>
               <button 
                 onClick={() => {
                   if (!parsedData) return;
                   const allText = parsedData.scenes.map((s: any, i: number) => `Scene ${i+1}:\nVisual: ${s.visual}\nAudio: ${s.audio}\nNarasi: ${s.narasi}\n`).join('\n');
                   navigator.clipboard.writeText(allText);
                   alert('Seluruh teks berhasil disalin!');
                 }}
                 className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-xl shadow-lg neu-flat hover:opacity-90 active:scale-95"
               >
                 Salin Seluruh Teks Saja
               </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-12 text-[var(--text-secondary)] space-y-2">
            <div className="text-4xl opacity-50 mb-2">📋</div>
            <p className="text-sm font-medium">Belum ada JSON yang diparse.</p>
            <p className="text-xs">Paste hasil JSON dari AI di kotak sebelah kiri lalu klik tombol Ekstrak.</p>
          </div>
        )}
      </div>

    </div>
  );
}
