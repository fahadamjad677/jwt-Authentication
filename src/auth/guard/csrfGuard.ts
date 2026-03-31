import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestWithAuth } from '../interface';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    const cookieToken = request.cookies['csrf_token'];
    const headerToken = request.headers['x-csrf-token'];

    // Step 1: Check existence
    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    // Step 2: Compare tokens (Double Submit Pattern)
    if (cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
