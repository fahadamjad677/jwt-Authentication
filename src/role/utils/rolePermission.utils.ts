// Input coming from DB (Role with nested permissions)
export type RoleWithPermissionsInput = {
  name: string;
  permissions: {
    permission: {
      name: string;
    };
  }[];
};

// Output sent to client (flattened permissions)
export type RoleWithPermissionsOutput = {
  name: string;
  permissions: {
    name: string;
  }[];
};

// // Overloads
export function transformRolePermissions(
  input: RoleWithPermissionsInput,
): RoleWithPermissionsOutput;

export function transformRolePermissions(
  input: RoleWithPermissionsInput[],
): RoleWithPermissionsOutput[];

// Implementation
export function transformRolePermissions(
  input: RoleWithPermissionsInput | RoleWithPermissionsInput[],
): RoleWithPermissionsOutput | RoleWithPermissionsOutput[] {
  const transform = (
    item: RoleWithPermissionsInput,
  ): RoleWithPermissionsOutput => ({
    name: item.name,
    permissions: item.permissions.map((p) => ({
      name: p.permission.name,
    })),
  });

  return Array.isArray(input) ? input.map(transform) : transform(input);
}
