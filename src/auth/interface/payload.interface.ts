import { Request } from 'express';

export interface RequestWithPayload extends Request {
  user: {
    email: string;
    sub: string;
    roleId: string;
    role: { name: string };
  };
}
