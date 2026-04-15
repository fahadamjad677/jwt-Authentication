import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuth } from '../interface';

export const GetCookies = createParamDecorator(
  (data: keyof RequestWithAuth['cookies'], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();

    if (data) {
      return request.cookies?.[data];
    }

    return request.cookies;
  },
);
