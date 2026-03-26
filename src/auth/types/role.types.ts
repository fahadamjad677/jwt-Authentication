export type RoleType = 'USER' | 'MODERATOR' | 'ADMIN';

export function isRoleType(role: string): role is RoleType {
  return ['USER', 'MODERATOR', 'ADMIN'].includes(role);
}
