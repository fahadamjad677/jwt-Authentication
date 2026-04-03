import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadUser } from './types';
import { generateCsrfToken } from '../comman/utils';
@Injectable()
export class AuthService {
  constructor(
    private prismaservice: PrismaService,
    private jwtservice: JwtService,
    private configservice: ConfigService,
  ) {}

  //Sign in
  async signin(dto: LoginDto) {
    //If user Exists then validates password.
    const user = (await this.prismaservice.user.findFirst({
      where: {
        email: dto.email,
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        loginAttempts: true,
        lockTime: true,
        roleId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })) as {
      id: string;
      email: string;
      password: string;
      roleId: string;
      role: { name: string };
      loginAttempts: number;
      lockTime: Date | null;
    };
    if (!user) {
      throw new BadRequestException(' Invalid Cridentails wrong email');
    }

    if (user.lockTime && user.lockTime > new Date()) {
      throw new BadRequestException('Account Locked Try Again Later.');
    }

    //checking password
    const result = await bcrypt.compare(dto.password, user.password);
    if (!result) {
      //Login failed due to wrong password then increasing the loginAttempt failed attribute.
      const attempts = user.loginAttempts + 1;

      const UpdateData: {
        loginAttempts: number;
        lockTime: Date | null;
      } = {
        loginAttempts: attempts,
        lockTime: null,
      };

      //if Greater then 3 then updating the db.
      if (attempts >= 3) {
        UpdateData.lockTime = new Date(Date.now() + 3 * 60 * 1000);
      }
      await this.prismaservice.user.update({
        where: {
          id: user.id,
        },
        data: UpdateData,
      });
      throw new UnauthorizedException('Invalid Cridentials');
    }

    //On correct password Resetting the lock and attemtps.
    await this.prismaservice.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockTime: null },
    });
    return this.signToken(user.id, user.email, user.role.name);
  }

  //Logut
  async Logout(payload: PayloadUser) {
    //deleting refresh Token from database.
    await this.prismaservice.user.update({
      where: {
        id: payload.sub,
      },
      data: {
        refreshToken: null,
      },
    });

    return 'logut Successfull';
  }
  //---------Token Encrpytion------------------
  async signToken(id: string, email: string, role: string) {
    const secretAcess = this.configservice.get<string>('JWT_ACCESS_SECRET');
    const secretRefresh = this.configservice.get<string>('JWT_REFRESH_SECRET');

    if (!secretAcess || !secretRefresh) {
      throw new Error('Jwt access or refresh secret not defined');
    }
    const payload = {
      sub: id,
      email: email,
      role: role,
    };

    //Acess Token Signed
    const access_token = await this.jwtservice.signAsync(payload, {
      expiresIn: '15m',
      secret: secretAcess,
    });

    //Refresh Token Signed
    const refresh_token = await this.jwtservice.signAsync(payload, {
      expiresIn: '60m',
      secret: secretRefresh,
    });

    //Hashing the Refresh and storing in database.
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);

    await this.prismaservice.user.update({
      where: { id: id },
      data: { refreshToken: hashedRefresh },
    });

    //CSRF TOKEN signing
    const csrf_token = generateCsrfToken();
    return { access_token, refresh_token, csrf_token };
  }

  //Refresh and CSRF rotattion
  async refresh(user: LoginDto) {
    //Finding User.
    const payload = (await this.prismaservice.user.findUnique({
      where: {
        email: user.email,
        isDeleted: false,
      },
      select: {
        email: true,
        id: true,
        roleId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })) as {
      email: string;
      id: string;
      roleId: string;
      role: { name: string };
    };

    if (!payload) {
      throw new BadRequestException(' Invalid Cridentails');
    }
    return this.signToken(payload.id, payload.email, payload.role.name);
  }
}
