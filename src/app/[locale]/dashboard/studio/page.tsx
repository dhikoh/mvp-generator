import PromptStudioClient from "./PromptStudioClient";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return null;

  const isActive = user.role !== 'USER_DEMO' && user.billingActiveUntil && new Date(user.billingActiveUntil) > new Date();

  const channels = await prisma.profileChannel.findMany({
    where: { userId: session.user.id, isLocked: false }
  });

  return (
    <div className="space-y-6 pb-6">
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold mb-1">Prompt Studio</h2>
        <p className="text-sm text-[var(--text-secondary)]">Pusat komando Anda untuk menciptakan prompt canggih (Video & Image).</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <PromptStudioClient channels={channels} isActive={!!isActive} />
      </div>
    </div>
  );
}
