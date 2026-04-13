export type InputUser = {
  id: string;
  email: string;
  role: {
    name: string;
    permissions: {
      permission: {
        name: string;
      };
    }[];
  } | null;
};

export type OutputUser = {
  id: string;
  email: string;
  role: string | null;
  permissions: string[];
};

//Overload
export function transformUsers(user: InputUser): OutputUser;
export function transformUsers(users: InputUser[]): OutputUser[];

//Implementation
export function transformUsers(
  users: InputUser | InputUser[],
): OutputUser | OutputUser[] {
  const transform = (user: InputUser): OutputUser => ({
    id: user.id,
    email: user.email,
    role: user.role?.name ?? null,
    permissions: user.role?.permissions.map((p) => p.permission.name) ?? [],
  });

  if (Array.isArray(users)) {
    return users.map(transform);
  }

  return transform(users);
}
