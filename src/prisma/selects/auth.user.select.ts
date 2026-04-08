import { Prisma } from '../../generated/prisma/client';

export const authUserSelect = {
  id: true,
  email: true,
  password: true,
  roleId: true,
  lockTime: true,
  loginAttempts: true,

  role: {
    select: {
      name: true,
      rolePermissions: {
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

  userPermissions: {
    select: {
      permission: {
        select: {
          resource: true,
          action: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
