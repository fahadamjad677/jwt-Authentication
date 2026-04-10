type InputUser = {
  id: string;
  email: string;
  role: {
    name: string;
    permissions: {
      permission: {
        name: string;
      };
    }[];
  };
};

type OutputUser = {
  id: string;
  email: string;
  role: {
    name: string;
    permissions: {
      name: string;
    }[];
  };
};

export function transformUsers(users: InputUser[]): OutputUser[] {
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    role: {
      name: user.role.name,
      permissions: (user.role.permissions ?? []).map((p) => ({
        name: p.permission.name,
      })),
    },
  }));
}
