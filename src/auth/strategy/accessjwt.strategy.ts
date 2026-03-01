import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { LoginDto } from '../dto';

import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadUser } from '../types';

@Injectable()
export class AcessjwtStrategy extends PassportStrategy(
  Strategy,
  'accessStrategy',
) {
  constructor(
    configservice: ConfigService,
    private prismaservice: PrismaService,
  ) {
    const secret = configservice.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('Jwt access Secret not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: LoginDto) {
    if (!payload) {
      throw new UnauthorizedException('Invalid Token');
    }
    const user = await this.prismaservice.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (user) {
      //payload
      const payload: PayloadUser = {
        email: user.email,
        sub: user.id,
      };
      return payload;
    }
    throw new UnauthorizedException('Invalid Token');
  }
}
