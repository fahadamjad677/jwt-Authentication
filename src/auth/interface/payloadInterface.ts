import { Request } from 'express';
import { PayloadUser } from '../../auth/types';

export interface RequestWithUser extends Request {
  user: PayloadUser;
}
