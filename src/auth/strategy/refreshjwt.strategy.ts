import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PayloadUser } from '../types';

interface RequestWithCookies extends Request {
  cookies: {
    refresh_token: string;
  };
}

@Injectable()
export class RefreshjwtStrategy extends PassportStrategy(
  Strategy,
  'refreshStrategy',
) {
  constructor(
    configservice: ConfigService,
    private prismaservice: PrismaService,
  ) {
    const secret = configservice.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('Jwt refresh Secret not defined');
    }

    //Most Important Fix....
    const extractRefreshToken = (req: Request): string | null => {
      const cookies = req.cookies;
      console.log(cookies);
      if (!cookies || typeof cookies.refresh_token !== 'string') {
        throw new UnauthorizedException('Token missing');
      }

      return cookies.refresh_token;
    };
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshToken]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }
  async validate(req: RequestWithCookies, payload: PayloadUser) {
    if (!payload) {
      throw new UnauthorizedException('Invalid Token');
    }

    const user = await this.prismaservice.user.findFirst({
      where: {
        email: payload.email,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }
    if (typeof req.cookies.refresh_token !== 'string') {
      throw new UnauthorizedException('Refresh Token Missing');
    }
    const result = await bcrypt.compare(
      req.cookies.refresh_token,
      user.refreshToken,
    );
    if (!result) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    //payload
    return payload;
  }
}
