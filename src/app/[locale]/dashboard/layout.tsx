import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/auth`);
  }

  // Allow all users (including Superadmin if they want to see dashboard)
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-color)]">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 glass-panel m-4 mr-0 rounded-2xl flex-col h-[calc(100vh-2rem)] overflow-y-auto shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[var(--accent)] tracking-wide">Creator</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href={`/${locale}/dashboard`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            🏠 Overview
          </Link>
          <Link href={`/${locale}/dashboard/channels`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            📺 Channel
          </Link>
          <Link href={`/${locale}/dashboard/studio`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ✨ Studio
          </Link>
          <Link href={`/${locale}/dashboard/drafts`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            📝 Drafts
          </Link>
          <Link href={`/${locale}/dashboard/billing`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            💳 Billing
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24 md:pb-4 overflow-y-auto">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bottom-nav glass-panel rounded-t-2xl border-b-0 border-x-0">
        <ul className="flex justify-around items-center p-3">
          <Link href={`/${locale}/dashboard`} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--accent)] smooth-transition cursor-pointer">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-semibold mt-1">Overview</span>
          </Link>
          <Link href={`/${locale}/dashboard/channels`} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--accent)] smooth-transition cursor-pointer">
            <span className="text-2xl">📺</span>
            <span className="text-xs font-semibold mt-1">Channel</span>
          </Link>
          <Link href={`/${locale}/dashboard/studio`} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--accent)] smooth-transition cursor-pointer -mt-6">
            <div className="bg-[var(--accent)] rounded-full p-4 shadow-lg text-white">
              <span className="text-2xl">✨</span>
            </div>
            <span className="text-xs font-semibold mt-1">Studio</span>
          </Link>
          <Link href={`/${locale}/dashboard/drafts`} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--accent)] smooth-transition cursor-pointer">
            <span className="text-2xl">📝</span>
            <span className="text-xs font-semibold mt-1">Drafts</span>
          </Link>
          <Link href={`/${locale}/dashboard/billing`} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--accent)] smooth-transition cursor-pointer">
            <span className="text-2xl">💳</span>
            <span className="text-xs font-semibold mt-1">Billing</span>
          </Link>
        </ul>
      </nav>
    </div>
  );
}
