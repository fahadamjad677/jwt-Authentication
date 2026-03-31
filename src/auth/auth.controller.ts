import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import type { Response } from 'express';
import { jwtRefreshGuard, jwtAcessGuard, CsrfGuard } from './guard';
import { Throttle } from '@nestjs/throttler';
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
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('csrf_token', tokens.csrf_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });
    return 'login successfull';
  }

  //logout
  @UseGuards(jwtAcessGuard, CsrfGuard)
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
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return this.authservice.Logout(user);
  }

  //refresh token
  @UseGuards(jwtRefreshGuard, CsrfGuard)
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
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });
    return 'refresh successful';
  }
}
