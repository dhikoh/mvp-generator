import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = useTranslations('Index');

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--accent)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="glass-panel max-w-3xl w-full p-10 md:p-16 rounded-[2.5rem] text-center relative z-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold mb-6 neu-pressed">
          🚀 MVP Generator v1.0
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Supercharge Your Content Creation
        </h1>
        
        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
          Tingkatkan produktivitas pembuatan konten Anda dengan AI Prompt JSON. Atur niche, hook, durasi, dan persona Anda secara presisi dan terstruktur.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href={`/${locale}/auth/register`} 
            className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] text-white font-bold rounded-2xl shadow-lg neu-flat hover:opacity-90 active:scale-95 transition"
          >
            Mulai Sekarang ⚡
          </Link>
          <Link 
            href={`/${locale}/auth/login`} 
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--text-secondary)] text-[var(--text-secondary)] font-bold rounded-2xl hover:bg-[var(--text-secondary)] hover:text-white transition active:scale-95"
          >
            Masuk ke Akun
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl relative z-10">
        <div className="neu-flat p-6 rounded-3xl text-center hover:scale-105 smooth-transition">
          <div className="text-4xl mb-3">🎨</div>
          <h3 className="font-bold mb-2">Multi-Channel</h3>
          <p className="text-xs text-[var(--text-secondary)]">Kelola banyak persona channel dalam satu dashboard.</p>
        </div>
        <div className="neu-flat p-6 rounded-3xl text-center hover:scale-105 smooth-transition">
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="font-bold mb-2">JSON Parser</h3>
          <p className="text-xs text-[var(--text-secondary)]">Pecah struktur scene otomatis dengan sempurna.</p>
        </div>
        <div className="neu-flat p-6 rounded-3xl text-center hover:scale-105 smooth-transition">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-bold mb-2">RBAC Terjamin</h3>
          <p className="text-xs text-[var(--text-secondary)]">Keamanan data dan kontrol tier berlapis.</p>
        </div>
      </div>
    </div>
  );
}
