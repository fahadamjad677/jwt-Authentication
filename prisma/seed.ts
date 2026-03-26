import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaClientOptions } from '@prisma/client/runtime/client';
import bcrypt from 'bcrypt';

// -------------------------
// 1️⃣ Setup Adapter
// -------------------------
const adapter: PrismaClientOptions['adapter'] = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// -------------------------
// 2️⃣ Create Prisma Client
// -------------------------
const prisma = new PrismaClient({ adapter });

// -------------------------
// 3️⃣ Seed Function
// -------------------------
async function main() {
  console.log('🌱 Seeding started...');

  // -------------------------
  // 🔹 Permissions
  // -------------------------
  const permissionsList = [
    'update_own_profile',
    'delete_account',
    'view_users',
    'view_user',
    'update_profile',
    'update_user_role',
    'create_bookmark',
    'view_own_bookmarks',
    'update_bookmark',
    'delete_bookmark',
    'view_all_bookmarks',
  ];

  const permissions = await Promise.all(
    permissionsList.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // -------------------------
  // 🔹 Roles
  // -------------------------
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'MODERATOR' },
    update: {},
    create: { name: 'MODERATOR' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  // -------------------------
  // 🔹 Helper Function
  // -------------------------
  const getPermissionId = (name: string) =>
    permissions.find((p) => p.name === name)?.id as string;

  // -------------------------
  // 🔹 Role Permissions
  // -------------------------

  // USER
  await prisma.rolePermission.createMany({
    data: [
      {
        roleId: userRole.id,
        permissionId: getPermissionId('update_own_profile'),
      },
      {
        roleId: userRole.id,
        permissionId: getPermissionId('delete_account'),
      },
    ],
    skipDuplicates: true,
  });

  // MODERATOR
  await prisma.rolePermission.createMany({
    data: [
      {
        roleId: moderatorRole.id,
        permissionId: getPermissionId('view_users'),
      },
      {
        roleId: moderatorRole.id,
        permissionId: getPermissionId('view_user'),
      },
      {
        roleId: moderatorRole.id,
        permissionId: getPermissionId('update_own_profile'),
      },
      {
        roleId: moderatorRole.id,
        permissionId: getPermissionId('view_own_bookmarks'),
      },
      {
        roleId: moderatorRole.id,
        permissionId: getPermissionId('view_all_bookmarks'),
      },
    ],
    skipDuplicates: true,
  });

  // ADMIN → gets ALL permissions
  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  // -------------------------
  // 🔹 Create ONE Admin User
  // -------------------------
  const adminEmail = 'admin@test.com';

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // don't overwrite existing admin
    create: {
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('👑 Admin user ensured');
  console.log('✅ Seeding completed');
}

// -------------------------
// 4️⃣ Execute Seed
// -------------------------
main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
