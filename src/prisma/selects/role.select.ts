import { Prisma } from '../../generated/prisma/client';

export const roleSelect = {
  name: true,
  id: true,
  createdBy: {
    select: {
      username: true,
    },
  },
} satisfies Prisma.RoleSelect;
