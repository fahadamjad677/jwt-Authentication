import { Request } from 'express';

export interface RequestWithHeaders extends Request {
  headers: {
    authorization?: string;
    'csrf-token'?: string;
    [key: string]: string | string[] | undefined;
  };
}
