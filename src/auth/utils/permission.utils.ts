import { userSelect } from '../../prisma/selects';
import { Prisma } from '../../generated/prisma/client';

type UserWithPermissions = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

type PermissionString = `${string}:${string}`;

//Map Permissions from object to string
function mapPermissions(
  permissions: { permission: { resource: string; action: string } }[],
): PermissionString[] {
  return permissions.map((p) =>
    toPermissionString(p.permission.resource, p.permission.action),
  );
}

function toPermissionString(
  resource: string,
  action: string,
): PermissionString {
  return `${resource}:${action}`;
}

export function buildPermissions(
  user: UserWithPermissions,
): PermissionString[] {
  // role is guaranteed
  const rolePermissions = mapPermissions(user.role.rolePermissions);

  // userPermissions may be empty but never undefined in Prisma select
  const userPermissions = mapPermissions(user.userPermissions);

  // deduplicate
  return [...new Set([...rolePermissions, ...userPermissions])];
}
