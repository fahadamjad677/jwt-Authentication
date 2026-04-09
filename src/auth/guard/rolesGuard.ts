import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { RequestWithPayload } from '../interface/payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPayload>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }
    const hasRole = requiredRoles.includes(user.role);

    console.log('requiredRoles:', requiredRoles);
    console.log('userRole', user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource ttt',
      );
    }

    return true;
  }
}
