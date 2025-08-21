import { randomBytes } from 'crypto';

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });
    await this.auditService.log(user.id, 'user_registered', { email: registerDto.email });
    return this.createTokens(user.id, user.role);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.auditService.log(user.id, 'user_login', { email: loginDto.email });
    return this.createTokens(user.id, user.role);
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.auditService.log(tokenRecord.userId, 'token_refreshed', {});
    return this.createTokens(
      tokenRecord.userId,
      (await this.usersService.findById(tokenRecord.userId))?.role || 'user',
    );
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (tokenRecord) {
      await this.auditService.log(tokenRecord.userId, 'user_logout', {});
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    }
  }

  private async createTokens(userId: string, role: string) {
    const accessToken = this.jwtService.sign({ sub: userId, role });
    const refreshToken = await this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(userId: string) {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + this.configService.get<number>('JWT_REFRESH_TTL', 7 * 24 * 60 * 60 * 1000),
    );
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
    return token;
  }
}
