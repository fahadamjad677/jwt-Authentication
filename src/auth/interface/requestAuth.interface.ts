import { Request } from 'express';

export interface RequestWithAuth extends Request {
  cookies: {
    csrf_token?: string;
    access_token?: string;
    refresh_token?: string;
  };

  headers: {
    authorization?: string;
    'x-csrf-token'?: string;
    [key: string]: string | string[] | undefined;
  };
}
