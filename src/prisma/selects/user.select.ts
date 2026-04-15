import { Prisma } from '../../generated/prisma/client';

export const userSelect = {
  id: true,
  email: true,

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
