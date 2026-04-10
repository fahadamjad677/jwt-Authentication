type InputPermissions = {
  name: string;
  permissions: {
    permission: {
      name: string;
    };
  }[];
};

type OutputPermissions = {
  name: string;
  permissions: {
    name: string;
  }[];
};

// Overloads
export function transformPermissions(
  input: InputPermissions,
): OutputPermissions;

export function transformPermissions(
  input: InputPermissions[],
): OutputPermissions[];

export function transformPermissions(
  input: InputPermissions | null,
): OutputPermissions | null;

// Implementation
export function transformPermissions(
  input: InputPermissions | InputPermissions[] | null,
): OutputPermissions | OutputPermissions[] | null {
  if (!input) return null;

  const transform = (item: InputPermissions): OutputPermissions => ({
    name: item.name,
    permissions: (item.permissions ?? [])
      .filter((p) => p.permission?.name)
      .map((p) => ({
        name: p.permission.name,
      })),
  });

  return Array.isArray(input) ? input.map(transform) : transform(input);
}
