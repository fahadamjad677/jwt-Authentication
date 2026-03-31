import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadUser } from './types';
import { generateCsrfToken } from 'src/comman/utils';
@Injectable()
export class AuthService {
  constructor(
    private prismaservice: PrismaService,
    private jwtservice: JwtService,
    private configservice: ConfigService,
  ) {}
  //Sign up
  async signup(dto: RegisterDto) {
    //If user Exists then return without registring.
    const user = await this.prismaservice.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      throw new BadRequestException(' Email Already Exists');
    }

    //Creating hash for password.
    const hashed = await bcrypt.hash(dto.password, 10);

    // Get default role (user)
    const defaultRole = await this.prismaservice.role.findUnique({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new Error('Default role not found. Please seed roles.');
    }
    //Registring User in database.
    const userInsert = await this.prismaservice.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashed,
        isEmailVerified: false,
        roleId: defaultRole.id,
        isActive: true,
        loginAttempts: 0,
      },
      select: {
        email: true,
        username: true,
      },
    });

    return userInsert;
  }

  //Sign in
  async signin(dto: LoginDto) {
    //If user Exists then validates password.
    const user = await this.prismaservice.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        email: true,
        username: true,
        password: true,
        id: true,
        loginAttempts: true,
        lockTime: true,
      },
    });
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

    return this.signToken(user.id, user.email);
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
  }
  //---------Token Encrpytion------------------
  async signToken(id: string, email: string) {
    const secretAcess = this.configservice.get<string>('JWT_ACCESS_SECRET');
    const secretRefresh = this.configservice.get<string>('JWT_REFRESH_SECRET');

    if (!secretAcess || !secretRefresh) {
      throw new Error('Jwt access or refresh secret not defined');
    }
    const payload = {
      sub: id,
      email: email,
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
    const payload = await this.prismaservice.user.findUnique({
      where: {
        email: user.email,
      },
      select: {
        email: true,
        id: true,
      },
    });
    if (!payload) {
      throw new BadRequestException(' Invalid Cridentails');
    }
    return this.signToken(payload.id, payload.email);
  }
}
