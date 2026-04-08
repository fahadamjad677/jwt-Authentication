import 'dotenv/config';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { type PrismaClientOptions } from '@prisma/client/runtime/client';
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

  await prisma.$transaction(async (tx) => {
    // -------------------------
    // 1️⃣ Create Super Admin Role
    // -------------------------
    const superAdminRole = await tx.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        type: 'SUPER_ADMIN',
      },
    });

    // -------------------------
    // 2️⃣ Create Super Admin User
    // -------------------------
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = await tx.user.upsert({
      where: { email: 'superadmin@test.com' },
      update: {},
      create: {
        email: 'superadmin@test.com',
        password: hashedPassword,
        roleId: superAdminRole.id,
        createdById: null,
      },
    });

    // -------------------------
    // 3️⃣ Fix Role createdById
    // -------------------------
    if (!superAdminRole.createdById) {
      await tx.role.update({
        where: { id: superAdminRole.id },
        data: {
          createdById: superAdmin.id,
        },
      });
    }

    // -------------------------
    // 4️⃣ FULL SYSTEM PERMISSIONS
    // -------------------------
    const resources = ['user', 'role', 'permission', 'bookmark'];

    const actions = [
      'create',
      'read',
      'update',
      'delete',
      'assign-permissions', // special action
    ];

    const permissions = [];

    for (const resource of resources) {
      for (const action of actions) {
        const perm = await tx.permission.upsert({
          where: {
            resource_action: {
              resource,
              action,
            },
          },
          update: {
            createdById: superAdmin.id,
          },
          create: {
            resource,
            action,
            createdById: superAdmin.id,
          },
        });

        permissions.push(perm);
      }
    }

    // -------------------------
    // 5️⃣ Assign ALL Permissions to SUPER_ADMIN
    // -------------------------
    await tx.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: superAdminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    console.log('👑 Super Admin seeded with FULL access');
  });

  console.log('✅ Seeding completed');
}

// -------------------------
// Run Seed
// -------------------------
main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
