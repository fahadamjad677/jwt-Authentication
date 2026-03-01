import { PayloadUser } from '../auth/types';

declare global {
  namespace Express {
    type User = PayloadUser;
  }
}
