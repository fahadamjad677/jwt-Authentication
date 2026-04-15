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
        createdById: null, // ✅ root
      },
    });

    // -------------------------
    // 3️⃣ Fix Role createdById (ONLY if null)
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
    // 4️⃣ Permissions
    // -------------------------
    const permissionsData = [
      { resource: 'user', action: 'create' },
      { resource: 'user', action: 'read' },
      { resource: 'user', action: 'update' },
      { resource: 'user', action: 'delete' },

      { resource: 'role', action: 'create' },
      { resource: 'role', action: 'read' },
      { resource: 'role', action: 'update' },
      { resource: 'role', action: 'delete' },

      { resource: 'permission', action: 'create' },
      { resource: 'permission', action: 'read' },

      { resource: 'bookmark', action: 'create' },
      { resource: 'bookmark', action: 'read' },
      { resource: 'bookmark', action: 'update' },
      { resource: 'bookmark', action: 'delete' },
    ];

    const permissions = [];

    for (const p of permissionsData) {
      const perm = await tx.permission.upsert({
        where: {
          resource_action: {
            resource: p.resource,
            action: p.action,
          },
        },
        update: {
          // ✅ ensure creator is fixed if missing
          createdById: superAdmin.id,
        },
        create: {
          name: `${p.resource}:${p.action}`,
          resource: p.resource,
          action: p.action,
          createdById: superAdmin.id,
        },
      });

      permissions.push(perm);
    }

    // -------------------------
    // 5️⃣ Assign Permissions
    // -------------------------
    await tx.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: superAdminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    console.log('👑 Super Admin created');
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
