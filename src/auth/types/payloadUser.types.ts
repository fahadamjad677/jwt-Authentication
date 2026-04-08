export type PayloadUser = {
  email: string;
  sub: string;
  roleId: string;
  role: { name: string };
  permissions: string[];
};
