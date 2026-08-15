

import prisma from "@/lib/prisma";

/**
 * Logic to lock excessive channels if a user downgrades their tier or expires.
 * For instance, from Pro (3 channels) to Standard (1 channel), 
 * we lock the 2 least recently used channels.
 */
export async function enforceChannelLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { channels: { orderBy: { lastUsedAt: 'desc' } } }
  });

  if (!user) return;

  const isActive = user.billingActiveUntil && new Date(user.billingActiveUntil) > new Date();
  
  let allowedCount = 1; // Default fallback to Standard/Demo limit
  
  if (isActive) {
    if (user.role === 'USER_ULTRA' || user.role === 'SUPERADMIN') {
      allowedCount = 10;
    } else if (user.role === 'USER_PRO') {
      allowedCount = 3;
    } else {
      allowedCount = 1;
    }
  } else {
    // If expired, maybe we fall back to 1 channel (or 0 if totally locked)
    allowedCount = 1;
  }

  const { channels } = user;
  
  // Channels are ordered by lastUsedAt desc, so the first `allowedCount` channels are kept.
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const shouldBeLocked = i >= allowedCount;

    if (channel.isLocked !== shouldBeLocked) {
      await prisma.profileChannel.update({
        where: { id: channel.id },
        data: { isLocked: shouldBeLocked }
      });
    }
  }
}
