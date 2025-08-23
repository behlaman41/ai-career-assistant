import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuditService } from '../modules/audit/audit.service';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { UsersService } from '../modules/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
        { provide: UsersService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: AuditService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'test@example.com', password: 'password' };
      const tokens = { id: 'user-id', accessToken: 'access', refreshToken: 'refresh' };
      authService.register.mockResolvedValue(tokens);

      const result = await controller.register(registerDto);
      expect(result).toEqual(tokens);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const tokens = { id: 'user-id', accessToken: 'access', refreshToken: 'refresh' };
      authService.login.mockResolvedValue(tokens);

      const result = await controller.login(loginDto);
      expect(result).toEqual(tokens);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const refreshToken = 'validRefreshToken';
      const tokens = { id: 'user-id', accessToken: 'newAccess', refreshToken: 'newRefresh' };
      authService.refresh.mockResolvedValue(tokens);

      const result = await controller.refresh(refreshToken);
      expect(result).toEqual(tokens);
      expect(authService.refresh).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const refreshToken = 'validRefreshToken';
      authService.logout.mockResolvedValue(undefined);

      await controller.logout(refreshToken);
      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
    });
  });
});
