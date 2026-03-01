import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithCookies } from '../interface/cookie.interface';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithCookies>();

    return data ? request.cookies?.[data] : request.cookies;
  },
);
