import { Role } from '../../generated/prisma/enums';

export type PayloadUser = {
  sub: string;
  email: string;
  role: Role;
};
