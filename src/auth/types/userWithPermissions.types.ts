export type UserWithPermissions = {
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
