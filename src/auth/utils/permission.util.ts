import { userSelect } from '../../prisma/selects';
import { Prisma } from '../../generated/prisma/client';

type UserWithPermissions = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

type PermissionString = string;

export function buildPermissions(
  user: UserWithPermissions,
): PermissionString[] {
  return user.role.permissions.map((p) => p.permission.name);
}
