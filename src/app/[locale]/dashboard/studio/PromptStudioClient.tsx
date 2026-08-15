"use client";

import { useState } from "react";
import { generateMasterPrompt } from "@/lib/promptGenerator";

export default function PromptStudioClient({ channels, isActive }: { channels: any[], isActive: boolean }) {
  const [tab, setTab] = useState<'video' | 'image'>('video');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isRequestTitle, setIsRequestTitle] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [form, setForm] = useState({
    pov: 'expert',
    title: '',
    tone: 'casual',
    topic: '',
    targetPlatform: 'tiktok',
    includeHook: true,
    includeCta: true,
    includeCaption: true,
    includeThumbnail: false,
    sceneCount: 'auto',
    aspectRatio: '9:16',
    duration: 30, // seconds
    speakingRate: 0.35, // words per sec
    hookStyle: 'pertanyaan',
    endingStyle: 'ajakan_aksi',
    compEdu: 40,
    compEnt: 40,
    compMark: 20,
    includeHtml: false,
    excludedTitles: ''
  });

  const handleGenerate = async () => {
    if (!isActive) {
      alert("Masa aktif billing Anda telah habis. Silakan perpanjang di menu Billing.");
      return;
    }
    if (!selectedChannel) {
      alert("Harap pilih Profile Channel terlebih dahulu.");
      return;
    }
    if (!form.topic) {
      alert("Harap isi topik atau ide konten.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Hit increment usage API
      await fetch('/api/channels/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: selectedChannel })
      });

      const channelData = channels.find(c => c.id === selectedChannel);

      const parsedExcludedTitles = form.excludedTitles
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const promptText = generateMasterPrompt({
        channelName: channelData?.channelName || "Channel Baru",
        niche: channelData?.niche || "Umum",
        visualAesthetic: channelData?.visualAesthetic || "Realistis",
        pov: form.pov,
        title: form.title,
        requestTitles: isRequestTitle,
        excludedTitles: parsedExcludedTitles,
        topic: form.topic,
        targetPlatform: form.targetPlatform,
        includeHook: form.includeHook,
        includeCta: form.includeCta,
        includeCaption: form.includeCaption,
        includeThumbnail: form.includeThumbnail,
        aspectRatio: form.aspectRatio,
        duration: form.duration,
        speakingRate: form.speakingRate,
        hookStyle: form.hookStyle,
        endingStyle: form.endingStyle,
        compEdu: form.compEdu,
        compEnt: form.compEnt,
        compMark: form.compMark,
        includeHtml: form.includeHtml
      });

      setGeneratedPrompt(promptText);
    } catch (err) {
      alert("Gagal membuat prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {!isActive && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 text-red-500 font-semibold border border-red-500/30">
          ⚠️ Akun Anda belum diverifikasi atau masa aktif billing telah habis. Anda tidak dapat men-generate prompt.
        </div>
      )}
      
      {/* existing tabs and form code ... (this is long so I'll just keep the whole component here to be safe) */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setTab('video')}
          className={`pb-2 px-4 font-semibold ${tab === 'video' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          🎬 Video Prompt
        </button>
        <button 
          onClick={() => setTab('image')}
          className={`pb-2 px-4 font-semibold ${tab === 'image' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          🖼️ Image Prompt
        </button>
      </div>

      {tab === 'video' && (
        <fieldset disabled={isGenerating} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dasar */}
            <div className="glass-panel p-4 rounded-2xl space-y-4">
              <h3 className="font-bold border-b border-[var(--text-secondary)] pb-2">Informasi Dasar</h3>
              <div>
                <label className="block text-xs font-medium mb-1">Pilih Profile Channel</label>
                <select 
                  value={selectedChannel} 
                  onChange={e => setSelectedChannel(e.target.value)}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent"
                >
                  <option value="">-- Pilih --</option>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.channelName}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">POV / Persona AI</label>
                <select value={form.pov} onChange={e => setForm({...form, pov: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                  <option value="expert">Expert / Ahli</option>
                  <option value="friend">Sahabat (Casual)</option>
                  <option value="storyteller">Pendongeng</option>
                  <option value="reviewer">Reviewer Jujur</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold">Tentukan Judul Manual / Minta Ide Judul</label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isRequestTitle} 
                      onChange={(e) => setIsRequestTitle(e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-sm font-medium">Minta AI Generate 10 Judul</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  disabled={isRequestTitle}
                  placeholder={isRequestTitle ? "AI akan meng-generate 10 judul untuk dipilih..." : "Tulis judul manual..."}
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent disabled:opacity-50"
                />
              </div>

              {isRequestTitle && (
                <div className="space-y-2 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Judul yang Dikecualikan (Satu per baris)
                  </label>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">
                    Masukkan judul-judul yang sudah pernah digunakan sebelumnya agar AI tidak merekomendasikannya kembali.
                  </p>
                  <textarea 
                    placeholder="Contoh:&#10;5 Cara Mengatasi Hama&#10;Pupuk Organik Terbaik 2026"
                    value={form.excludedTitles} 
                    onChange={e => setForm({...form, excludedTitles: e.target.value})}
                    className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent h-20"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">Topik & Ide Konten (Sertakan #Hastag)</label>
                <textarea 
                  rows={2} 
                  value={form.topic} 
                  onChange={e => setForm({...form, topic: e.target.value})}
                  placeholder="Misal: Bahas cara hemat baterai hp #tipsandroid"
                  className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            {/* Format & Struktur */}
            <div className="glass-panel p-4 rounded-2xl space-y-4">
              <h3 className="font-bold border-b border-[var(--text-secondary)] pb-2">Format & Komposisi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Target Platform</label>
                  <select value={form.targetPlatform} onChange={e => setForm({...form, targetPlatform: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value="tiktok">TikTok / Reels / Shorts</option>
                    <option value="youtube">YouTube Long Form</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Aspec Ratio</label>
                  <select value={form.aspectRatio} onChange={e => setForm({...form, aspectRatio: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="16:9">16:9 (Horizontal)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Durasi (Detik)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Laju Bicara (Kata/Detik)</label>
                  <select value={form.speakingRate} onChange={e => setForm({...form, speakingRate: parseFloat(e.target.value)})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value={0.25}>0.25 (Sangat Lambat)</option>
                    <option value={0.3}>0.30 (Lambat)</option>
                    <option value={0.35}>0.35 (Normal/Cepat)</option>
                    <option value={0.4}>0.40 (Sangat Cepat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Bagian Naskah (Ceklis yang diperlukan)</label>
                <div className="flex flex-wrap gap-3">
                  <label className="text-xs flex items-center space-x-1"><input type="checkbox" checked={form.includeHook} onChange={e => setForm({...form, includeHook: e.target.checked})} className="rounded"/> <span>Hook</span></label>
                  <label className="text-xs flex items-center space-x-1"><input type="checkbox" checked={form.includeCta} onChange={e => setForm({...form, includeCta: e.target.checked})} className="rounded"/> <span>CTA</span></label>
                  <label className="text-xs flex items-center space-x-1"><input type="checkbox" checked={form.includeCaption} onChange={e => setForm({...form, includeCaption: e.target.checked})} className="rounded"/> <span>Caption Medsos</span></label>
                  <label className="text-xs flex items-center space-x-1"><input type="checkbox" checked={form.includeThumbnail} onChange={e => setForm({...form, includeThumbnail: e.target.checked})} className="rounded"/> <span>Ide Thumbnail</span></label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Komposisi Naskah (Total Wajib 100%)</label>
                <div className="flex space-x-2">
                  <div className="flex-1 text-center"><input type="number" value={form.compEdu} onChange={e => setForm({...form, compEdu: parseInt(e.target.value)})} className="w-full p-1 rounded neu-pressed text-xs text-center" /> <span className="text-[10px]">Edu</span></div>
                  <div className="flex-1 text-center"><input type="number" value={form.compEnt} onChange={e => setForm({...form, compEnt: parseInt(e.target.value)})} className="w-full p-1 rounded neu-pressed text-xs text-center" /> <span className="text-[10px]">Hiburan</span></div>
                  <div className="flex-1 text-center"><input type="number" value={form.compMark} onChange={e => setForm({...form, compMark: parseInt(e.target.value)})} className="w-full p-1 rounded neu-pressed text-xs text-center" /> <span className="text-[10px]">Marketing</span></div>
                </div>
              </div>
            </div>

            {/* Optimasi Lanjutan */}
            <div className="glass-panel p-4 rounded-2xl space-y-4 md:col-span-2">
              <h3 className="font-bold border-b border-[var(--text-secondary)] pb-2">Optimasi Video Pendek (Retensi)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Hook Pembuka</label>
                  <select value={form.hookStyle} onChange={e => setForm({...form, hookStyle: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value="auto">Auto AI</option>
                    <option value="shock">Shock / Kaget</option>
                    <option value="curiosity">Curiosity / Penasaran</option>
                    <option value="myth_buster">Myth Buster</option>
                    <option value="pain_point">Direct Pain Point</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Transisi Penutup (Ending)</label>
                  <select value={form.endingStyle} onChange={e => setForm({...form, endingStyle: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value="seamless">Seamless Loop (Nyambung ke awal)</option>
                    <option value="normal">Normal Ending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Sertakan Tag HTML Blog?</label>
                  <select value={form.includeHtml ? 'yes' : 'no'} onChange={e => setForm({...form, includeHtml: e.target.value === 'yes'})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                    <option value="no">Tidak</option>
                    <option value="yes">Ya (Buatkan versi artikel HTML)</option>
                  </select>
                </div>
              </div>
            </div>
            
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--text-secondary)]">
            <button 
              type="button" 
              onClick={handleGenerate}
              disabled={!isActive || isGenerating}
              className="px-6 py-3 rounded-xl neu-flat bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 active:scale-95 smooth-transition shadow-lg shadow-[var(--accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Memproses...' : '⚡ Generate Prompt!'}
            </button>
          </div>
        </fieldset>
      )}

      {tab === 'image' && (
         <div className="p-8 text-center text-[var(--text-secondary)] neu-pressed rounded-2xl">
           Modul Image Prompt Studio sedang dikembangkan.
         </div>
      )}

      {/* Generated Prompt Modal */}
      {generatedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-3xl p-6 rounded-3xl relative flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2">Master Prompt Berhasil Dibuat! 🎉</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Salin teks di bawah ini dan tempel (paste) ke AI eksternal seperti ChatGPT, Claude, atau Gemini.</p>
            
            <textarea 
              readOnly 
              value={generatedPrompt} 
              className="w-full flex-1 min-h-[300px] p-4 rounded-2xl neu-pressed border-none outline-none text-sm font-mono whitespace-pre-wrap overflow-y-auto"
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setGeneratedPrompt(null)}
                className="px-4 py-2 rounded-xl neu-flat text-[var(--text-secondary)] font-semibold text-sm"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  alert("Prompt disalin ke clipboard!");
                }}
                className="px-4 py-2 rounded-xl neu-flat bg-[var(--accent)] text-white font-semibold text-sm"
              >
                📋 Salin Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
