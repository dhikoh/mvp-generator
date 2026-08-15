
import UserManagementClient from "./UserManagementClient";

import prisma from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { channels: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen User</h2>
          <p className="text-sm text-[var(--text-secondary)]">Kelola role, tier, reset password, dan akses channel.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <UserManagementClient users={users} />
      </div>
    </div>
  );
}
