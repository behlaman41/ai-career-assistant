import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';

interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
@Throttle({ default: { limit: 20, ttl: 900000 } })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('token')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
