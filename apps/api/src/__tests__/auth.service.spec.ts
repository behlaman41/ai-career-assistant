import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AuditService } from '../modules/audit/audit.service';
import { AuthService } from '../modules/auth/auth.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { UsersService } from '../modules/users/users.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: Role.user,
    createdAt: new Date(),
  };

  const mockRefreshToken = {
    id: 'token-123',
    userId: 'user-123',
    token: 'refresh-token-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
            },
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    auditService = module.get(AuditService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('access-token');
      configService.get.mockReturnValue(7 * 24 * 60 * 60 * 1000);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashedPassword',
          name: registerDto.name,
        },
      });
      expect(auditService.log).toHaveBeenCalledWith(mockUser.id, 'user_registered', {
        email: registerDto.email,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw BadRequestException if email already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('access-token');
      configService.get.mockReturnValue(7 * 24 * 60 * 60 * 1000);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(auditService.log).toHaveBeenCalledWith(mockUser.id, 'user_login', {
        email: loginDto.email,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      // Arrange
      const userWithoutPassword = { ...mockUser, password: null };
      usersService.findByEmail.mockResolvedValue(userWithoutPassword);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens with valid refresh token', async () => {
      // Arrange
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-access-token');
      configService.get.mockReturnValue(7 * 24 * 60 * 60 * 1000);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({
        ...mockRefreshToken,
        token: 'new-refresh-token',
      });

      // Act
      const result = await service.refresh(refreshToken);

      // Assert
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(auditService.log).toHaveBeenCalledWith(mockRefreshToken.userId, 'token_refreshed', {});
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      // Arrange
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      // Arrange
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);

      // Act & Assert
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });
  });

  describe('logout', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully logout and delete refresh token', async () => {
      // Arrange
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      (prismaService.refreshToken.delete as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      await service.logout(refreshToken);

      // Assert
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(auditService.log).toHaveBeenCalledWith(mockRefreshToken.userId, 'user_logout', {});
      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });

    it('should handle logout gracefully if refresh token not found', async () => {
      // Arrange
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      await service.logout(refreshToken);

      // Assert
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(auditService.log).not.toHaveBeenCalled();
      expect(prismaService.refreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('createTokens (private method testing via public methods)', () => {
    it('should create access and refresh tokens', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('access-token-123');
      configService.get.mockReturnValue(7 * 24 * 60 * 60 * 1000);
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });
      expect(result.accessToken).toBe('access-token-123');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);
    });
  });
});
