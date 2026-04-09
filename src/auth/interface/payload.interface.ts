import { Request } from 'express';

export interface RequestWithPayload extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    permissions: `${string}:${string}`[];
  };
}
