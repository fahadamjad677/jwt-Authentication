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
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
