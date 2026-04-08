export type PayloadUser = {
  sub: string;
  email: string;
  role: string;
  permissions: `${string}:${string}`[];
};
