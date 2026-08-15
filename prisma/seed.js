const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // 1. SUPERADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mvp.com' },
    update: {},
    create: {
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@mvp.com',
      phoneNumber: '08111111111',
      passwordHash: passwordHash,
      role: 'SUPERADMIN',
      creditBalance: 9999,
      billingActiveUntil: new Date('2030-01-01T00:00:00.000Z')
    },
  });

  console.log('Created Admin:', admin.email, '/ Password: admin123');

  // 2. USER_PRO (Paid user)
  const proUser = await prisma.user.upsert({
    where: { email: 'pro@mvp.com' },
    update: {},
    create: {
      name: 'Pro User',
      username: 'prouser',
      email: 'pro@mvp.com',
      phoneNumber: '08222222222',
      passwordHash: userPasswordHash,
      role: 'USER_PRO',
      creditBalance: 300,
      billingActiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      channels: {
        create: [
          {
            channelName: 'Channel Pro 1',
            niche: 'Bisnis',
            description: 'Edukasi bisnis',
          },
          {
            channelName: 'Channel Pro 2',
            niche: 'Tech',
            description: 'Tech review',
          }
        ]
      }
    },
  });

  console.log('Created Pro User:', proUser.email, '/ Password: user123');

  // 3. USER_DEMO (Trial/Expired user)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@mvp.com' },
    update: {},
    create: {
      name: 'Demo User',
      username: 'demouser',
      email: 'demo@mvp.com',
      phoneNumber: '08333333333',
      passwordHash: userPasswordHash,
      role: 'USER_DEMO',
      creditBalance: 5,
      billingActiveUntil: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
      channels: {
        create: [
          {
            channelName: 'Channel Demo 1',
            niche: 'Gaming',
            description: 'Mabar bareng',
          }
        ]
      }
    },
  });

  console.log('Created Demo User (Expired):', demoUser.email, '/ Password: user123');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
