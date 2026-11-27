import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload, JwtStrategy } from './jwt.strategy';

// US-001 · C1 — JwtStrategy.validate rejects absent or inactive users (→ 401 via JwtAuthGuard).
describe('JwtStrategy (US-001 C1)', () => {
  let strategy: JwtStrategy;
  let usersService: { findById: jest.Mock };

  const payload: JwtPayload = { sub: 'user-1', email: 'user1@example.test' };

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-1',
      email: 'user1@example.test',
      active: true,
      ...overrides,
    }) as User;

  beforeEach(async () => {
    usersService = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-access-secret') },
        },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  // Scenario: Une requête authentifiée est refusée immédiatement après la désactivation
  it('returns null for an inactive user so the request is rejected with 401', async () => {
    usersService.findById.mockResolvedValue(buildUser({ active: false }));

    await expect(strategy.validate(payload)).resolves.toBeNull();
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });

  // Scenario: Un utilisateur actif n'est pas impacté
  it('returns the user when the account is active', async () => {
    const user = buildUser({ active: true });
    usersService.findById.mockResolvedValue(user);

    await expect(strategy.validate(payload)).resolves.toBe(user);
  });

  // Edge case C1: deleted account
  it('returns null when the user no longer exists', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(strategy.validate(payload)).resolves.toBeNull();
  });

  // Scenario: Un jeton d'accès encore valide est de nouveau accepté après une réactivation rapide
  it('accepts the same access token again once the account is reactivated (current state only, D3)', async () => {
    const reactivated = buildUser({ active: true });
    usersService.findById
      .mockResolvedValueOnce(buildUser({ active: false }))
      .mockResolvedValueOnce(reactivated);

    await expect(strategy.validate(payload)).resolves.toBeNull();
    await expect(strategy.validate(payload)).resolves.toBe(reactivated);
  });
});
