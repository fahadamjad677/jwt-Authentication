export type RoleType = 'user' | 'moderator' | 'admin';

export function isRoleType(role: string): role is RoleType {
  return ['user', 'moderator', 'admin'].includes(role);
}
