import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import type { Response } from 'express';
import { jwtRefreshGuard } from './guard/jwtRefreshGuard';
import { Throttle } from '@nestjs/throttler';
import { jwtAcessGuard } from './guard/jwtAccessGuard';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import type { PayloadUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}
  //Sign up
  @Post('signup')
  signup(@Body() dto: RegisterDto) {
    return this.authservice.signup(dto);
  }

  //Sign in
  //Using route-specific rate limiting.
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('signin')
  async signin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authservice.signin(dto);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { access_token: tokens.access_token };
  }

  //logout
  @UseGuards(jwtAcessGuard)
  @Post('logout')
  logout(
    @GetUser() user: PayloadUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return this.authservice.Logout(user);
  }

  //refresh token
  @UseGuards(jwtRefreshGuard)
  @Post('refresh')
  async refreshToken(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authservice.refresh(dto);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { access_token: tokens.access_token };
  }
}
