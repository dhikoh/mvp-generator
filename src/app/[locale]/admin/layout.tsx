import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-color)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel m-4 md:mr-0 rounded-2xl flex flex-col h-auto md:h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[var(--accent)] tracking-wide">Superadmin</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Control Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href={`/${locale}/admin`} className="block px-4 py-3 rounded-xl neu-flat hover:neu-pressed smooth-transition font-medium text-sm">
            📊 Overview
          </Link>
          <Link href={`/${locale}/admin/users`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            👥 Manajemen User
          </Link>
          <Link href={`/${locale}/admin/payments`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            💳 Verifikasi Pembayaran
          </Link>

          <Link href={`/${locale}/admin/settings`} className="block px-4 py-3 rounded-xl hover:neu-pressed smooth-transition font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ⚙️ CMS & Setting
          </Link>
        </nav>
        <div className="p-4 mt-auto">
           <div className="text-xs text-[var(--text-secondary)] text-center">
             Versi 1.0.0
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
