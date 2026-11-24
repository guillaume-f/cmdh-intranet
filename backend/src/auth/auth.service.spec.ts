import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

// US-001 · C2 — AuthService.refresh rejects inactive accounts and purges their session.
describe('AuthService (US-001 C2)', () => {
  const NOW = new Date('2026-11-24T12:00:00.000Z');
  const OLD_REFRESH_TOKEN = 'old-refresh-token';
  const OLD_TOKEN_ID = 'old-token-id';

  let service: AuthService;
  let usersService: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    setRefreshTokenSession: jest.Mock;
    clearRefreshTokenSession: jest.Mock;
  };
  let jwtService: { verify: jest.Mock; sign: jest.Mock; decode: jest.Mock };

  const sha256 = (value: string): string =>
    createHash('sha256').update(value).digest('hex');

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'user1@example.test',
      password: 'stored-bcrypt-hash',
      active: true,
      refreshTokenHash: sha256(OLD_REFRESH_TOKEN),
      refreshTokenId: OLD_TOKEN_ID,
      refreshTokenExpiresAt: new Date(NOW.getTime() + 60 * 60 * 1000),
      ...overrides,
    }) as User;

  beforeEach(async () => {
    jest.useFakeTimers({ now: NOW });

    usersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      setRefreshTokenSession: jest.fn().mockResolvedValue(undefined),
      clearRefreshTokenSession: jest.fn().mockResolvedValue(undefined),
    };

    let signCount = 0;
    jwtService = {
      verify: jest.fn().mockReturnValue({
        sub: 'user-1',
        email: 'user1@example.test',
        tokenId: OLD_TOKEN_ID,
        type: 'refresh',
      }),
      sign: jest.fn(() => `signed-token-${++signCount}`),
      decode: jest
        .fn()
        .mockReturnValue({ exp: Math.floor(NOW.getTime() / 1000) + 3600 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RolesService, useValue: { resolvePermissions: jest.fn() } },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => `cfg-${key}`) },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('refresh', () => {
    // Scenario: Le renouvellement de session est refusé à un compte désactivé
    it('rejects an inactive account with 401, purges its session and issues no token', async () => {
      usersService.findById.mockResolvedValue(buildUser({ active: false }));

      const result = service.refresh(OLD_REFRESH_TOKEN);

      await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(result).rejects.toThrow(
        'Refresh session expired or invalid.',
      );
      expect(usersService.clearRefreshTokenSession).toHaveBeenCalledWith(
        'user-1',
      );
      expect(usersService.setRefreshTokenSession).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    // Scenario: Un compte réactivé doit se reconnecter (old refresh token, session purged)
    it('rejects the old refresh token of a reactivated account whose session was purged', async () => {
      usersService.findById.mockResolvedValue(
        buildUser({
          active: true,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenExpiresAt: null,
        }),
      );

      const result = service.refresh(OLD_REFRESH_TOKEN);

      await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(result).rejects.toThrow('Refresh session not found.');
      expect(usersService.setRefreshTokenSession).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    // Scenarios: Un utilisateur actif n'est pas impacté / Modifier un compte actif sans le désactiver conserve sa session
    it('issues new tokens and stores the new session for an active account', async () => {
      usersService.findById.mockResolvedValue(buildUser({ active: true }));

      const result = await service.refresh(OLD_REFRESH_TOKEN);

      expect(result.token).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.refreshToken).not.toBe(OLD_REFRESH_TOKEN);
      expect(usersService.setRefreshTokenSession).toHaveBeenCalledWith(
        'user-1',
        sha256(result.refreshToken),
        expect.any(String),
        result.refreshExpiresAt,
      );
      expect(usersService.clearRefreshTokenSession).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    // Scenario: La connexion d'un compte désactivé reste refusée
    it('rejects an inactive account with 401 "Invalid credentials." and opens no session', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser({ active: false }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = service.login({
        email: 'user1@example.test',
        password: 'correct-password',
      });

      await expect(result).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(result).rejects.toThrow('Invalid credentials.');
      expect(usersService.setRefreshTokenSession).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    // Scenario: Un compte réactivé doit se reconnecter — "peut à nouveau se connecter"
    it('lets a reactivated account log in again with correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue(
        buildUser({
          active: true,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenExpiresAt: null,
        }),
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'user1@example.test',
        password: 'correct-password',
      });

      expect(result.loginDto.token).toEqual(expect.any(String));
      expect(usersService.setRefreshTokenSession).toHaveBeenCalledWith(
        'user-1',
        sha256(result.refreshToken),
        expect.any(String),
        result.refreshExpiresAt,
      );
    });
  });

  describe('logout', () => {
    // Scenario: Un utilisateur actif n'est pas impacté — "la déconnexion volontaire fonctionne comme avant"
    it('clears the refresh session of the token owner', async () => {
      await expect(service.logout(OLD_REFRESH_TOKEN)).resolves.toBeUndefined();
      expect(usersService.clearRefreshTokenSession).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('is a no-op without a refresh token', async () => {
      await expect(service.logout(undefined)).resolves.toBeUndefined();
      expect(usersService.clearRefreshTokenSession).not.toHaveBeenCalled();
    });
  });
});
