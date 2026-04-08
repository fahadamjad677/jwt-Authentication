import { Prisma } from '../../generated/prisma/client';

export const userSelect = {
  id: true,
  email: true,
  password: true,
  roleId: true,

  role: {
    select: {
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              resource: true,
              action: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
