"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthClient() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register' | 'forgot-password'>(defaultTab as any);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register State
  const [regForm, setRegForm] = useState({
    name: '', username: '', dateOfBirth: '', password: '', confirmPassword: '', email: '', phoneNumber: '',
    channelName: '', niche: '', description: '', cta1: '', cta2: '',
    visualAesthetic: 'realistic', audioBGM: true, audioSFX: true, audioVO: true,
    socialLinks: { tiktok: '', instagram: '', youtube: '', facebook: '', website: '' }
  });
  
  const [step, setStep] = useState(1); // 1: User Info, 2: Profile Channel
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      identifier,
      password: loginPassword,
    });
    setLoading(false);
    
    if (res?.error) {
      setError('Kredensial tidak valid. Silakan periksa kembali.');
    } else {
      const session = await getSession();
      if (session?.user && (session.user as any).role === 'SUPERADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Silakan masukkan email atau username Anda terlebih dahulu.');
      return;
    }
    setStep(4); // 4: Forgot Password Success
  };

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regForm.username,
          email: regForm.email,
          phoneNumber: regForm.phoneNumber
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Data sudah terdaftar');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError('Kesalahan jaringan saat memeriksa ketersediaan akun.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat mendaftar');
      } else {
        setSuccessMsg('Pendaftaran berhasil! Akun Anda sedang menunggu konfirmasi admin.');
        setStep(3); // Wait step
      }
    } catch (err) {
      setError('Kesalahan jaringan, coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 smooth-transition">
        {step !== 3 && step !== 4 && (
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => { setTab('login'); setStep(1); }}
              className={`pb-2 px-4 font-semibold ${tab === 'login' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab('register'); setStep(1); }}
              className={`pb-2 px-4 font-semibold ${tab === 'register' ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
            >
              Register
            </button>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        {tab === 'login' && step !== 3 && (
          <form onSubmit={handleLogin} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username / Email / No. HP</label>
              <input 
                type="text" 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full p-3 rounded-xl neu-pressed border-none outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full p-3 rounded-xl neu-pressed border-none outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[var(--text-secondary)]"
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded" />
                <span>Ingat Saya</span>
              </label>
              <button type="button" onClick={() => setTab('forgot-password')} className="text-[var(--accent)] hover:underline">Lupa password?</button>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-3 mt-4 rounded-xl neu-flat text-white bg-[var(--accent)] font-semibold hover:opacity-90 active:scale-95 smooth-transition"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
            </fieldset>
          </form>
        )}

        {tab === 'register' && step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
              <h3 className="text-lg font-bold mb-2">Informasi Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nama Lengkap *</label>
                <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} autoComplete="name" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Username *</label>
                <input type="text" required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} autoComplete="username" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email *</label>
                <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} autoComplete="email" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">No. HP *</label>
                <input type="tel" required value={regForm.phoneNumber} onChange={e => setRegForm({...regForm, phoneNumber: e.target.value})} autoComplete="tel" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Tanggal Lahir *</label>
                <input type="date" required value={regForm.dateOfBirth} onChange={e => setRegForm({...regForm, dateOfBirth: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Password *</label>
                <input type="password" required value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} autoComplete="new-password" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Konfirmasi Password *</label>
                <input type="password" required value={regForm.confirmPassword} onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})} autoComplete="new-password" className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-3 mt-4 rounded-xl neu-flat text-white bg-[var(--accent)] font-semibold hover:opacity-90 active:scale-95 smooth-transition"
            >
              {loading ? 'Memeriksa...' : 'Lanjutkan'}
            </button>
            </fieldset>
          </form>
        )}

        {tab === 'register' && step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
              <h3 className="text-lg font-bold mb-2">Profile Channel (Wajib)</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 pb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nama Channel *</label>
                <input type="text" required value={regForm.channelName} onChange={e => setRegForm({...regForm, channelName: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Niche & Deskripsi *</label>
                <textarea required rows={2} value={regForm.description} onChange={e => setRegForm({...regForm, description: e.target.value, niche: e.target.value.split(' ')[0]})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">CTA Utama</label>
                <input type="text" value={regForm.cta1} onChange={e => setRegForm({...regForm, cta1: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Estetika Visual Default</label>
                <select value={regForm.visualAesthetic} onChange={e => setRegForm({...regForm, visualAesthetic: e.target.value})} className="w-full p-2 rounded-xl neu-pressed border-none outline-none text-sm bg-transparent">
                  <option value="realistic">Realistis</option>
                  <option value="claymotion">Claymotion</option>
                  <option value="3d_pixar">3D Pixar</option>
                  <option value="faceless">Faceless</option>
                  <option value="sharia">Sesuai Syariat (Tanpa Wajah)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium mb-1">Pengaturan Audio</label>
                <div className="flex items-center justify-between text-sm px-2">
                  <span>BGM</span>
                  <input type="checkbox" checked={regForm.audioBGM} onChange={e => setRegForm({...regForm, audioBGM: e.target.checked})} className="rounded"/>
                </div>
                <div className="flex items-center justify-between text-sm px-2">
                  <span>SFX</span>
                  <input type="checkbox" checked={regForm.audioSFX} onChange={e => setRegForm({...regForm, audioSFX: e.target.checked})} className="rounded"/>
                </div>
                <div className="flex items-center justify-between text-sm px-2">
                  <span>Narasi / VO</span>
                  <input type="checkbox" checked={regForm.audioVO} onChange={e => setRegForm({...regForm, audioVO: e.target.checked})} className="rounded"/>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-1/3 p-3 rounded-xl neu-flat text-[var(--text-primary)] font-semibold hover:opacity-90 active:scale-95 smooth-transition"
              >
                Kembali
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="w-2/3 p-3 rounded-xl neu-flat text-white bg-[var(--accent)] font-semibold hover:opacity-90 active:scale-95 smooth-transition"
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
            </fieldset>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-8">
            <h2 className="text-2xl font-bold text-green-600">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-[var(--text-secondary)]">{successMsg}</p>
            <div className="p-4 rounded-xl neu-pressed bg-transparent">
              <p className="text-sm mb-4">Ingin segera disetujui? Hubungi Admin kami sekarang:</p>
              <a 
                href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20sudah%20mendaftar%20MVP%20Generator%20dan%20menunggu%20konfirmasi." 
                target="_blank" 
                rel="noreferrer"
                className="inline-block px-6 py-3 rounded-xl neu-flat text-white bg-green-500 font-semibold hover:opacity-90 active:scale-95 smooth-transition"
              >
                Chat WhatsApp Admin
              </a>
            </div>
            <button 
              onClick={() => { setStep(1); setTab('login'); }}
              className="text-[var(--accent)] text-sm hover:underline"
            >
              Kembali ke Login
            </button>
          </div>
        )}

        {tab === 'forgot-password' && step !== 4 && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
              <h3 className="text-xl font-bold mb-2">Lupa Password</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Masukkan email Anda. Kami akan memverifikasi dan menghubungkan Anda dengan Admin untuk proses reset.</p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email / Username</label>
              <input 
                type="text" 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="email"
                className="w-full p-3 rounded-xl neu-pressed border-none outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full p-3 mt-4 rounded-xl neu-flat text-white bg-[var(--accent)] font-semibold hover:opacity-90 active:scale-95 smooth-transition"
            >
              Minta Reset Password
            </button>
            <button 
              type="button"
              onClick={() => setTab('login')}
              className="w-full p-3 mt-2 rounded-xl neu-flat text-[var(--text-secondary)] bg-transparent font-semibold hover:opacity-90 active:scale-95 smooth-transition"
            >
              Kembali
            </button>
            </fieldset>
          </form>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-8">
            <h2 className="text-2xl font-bold text-[var(--accent)]">Permintaan Dicatat</h2>
            <p className="text-sm text-[var(--text-secondary)]">Untuk keamanan (Tahap MVP), silakan hubungi Admin dengan menekan tombol di bawah agar password Anda segera direset secara manual.</p>
            <div className="p-4 rounded-xl neu-pressed bg-transparent mt-4">
              <a 
                href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20mereset%20password%20untuk%20akun%20${identifier}.`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block px-6 py-3 rounded-xl neu-flat text-white bg-green-500 font-semibold hover:opacity-90 active:scale-95 smooth-transition"
              >
                Chat WhatsApp Admin
              </a>
            </div>
            <button 
              onClick={() => { setStep(1); setTab('login'); }}
              className="text-[var(--accent)] text-sm hover:underline mt-4 block mx-auto"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
