import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceValidation } from '../activities/entities/attendance-validation.entity';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

// US-001 · C3 + C4 — self-deactivation guard, session revocation on deactivation,
// conditional refresh-session write.
describe('UsersService (US-001 C3/C4)', () => {
  const SELF_DEACTIVATION_MESSAGE =
    'An administrator cannot deactivate their own account.';
  const SESSION_EXPIRES_AT = new Date('2026-12-01T00:00:00.000Z');

  let service: UsersService;
  let usersRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let rolesService: { findById: jest.Mock; resolvePermissions: jest.Mock };

  const adminRole = {
    id: 'admin',
    label: 'Administrateur',
    permissions: [],
  } as Role;
  const memberRole = { id: 'member', label: 'Membre', permissions: [] } as Role;

  const buildUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-2',
      email: 'user2@example.test',
      password: 'stored-hash',
      firstName: 'Jane',
      lastName: 'Doe',
      role: memberRole,
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678901',
      entryYear: 2020,
      refreshTokenHash: 'session-hash',
      refreshTokenId: 'session-id',
      refreshTokenExpiresAt: SESSION_EXPIRES_AT,
      ...overrides,
    }) as User;

  const savedUser = (): User => {
    const [[user]] = usersRepository.save.mock.calls as [[User]];
    return user;
  };

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      save: jest.fn((user: User) => Promise.resolve(user)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    rolesService = {
      findById: jest.fn(),
      resolvePermissions: jest.fn().mockReturnValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(AttendanceValidation), useValue: {} },
        { provide: RolesService, useValue: rolesService },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('updateUser — self-deactivation guard', () => {
    // Scenario: Le serveur refuse qu'un administrateur désactive son propre compte
    it('rejects with 400 and the exact message, without loading or saving anything', async () => {
      const result = service.updateUser(
        'admin-1',
        { active: false },
        'admin-1',
      );

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      await expect(result).rejects.toThrow(SELF_DEACTIVATION_MESSAGE);
      expect(usersRepository.findOne).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it('returns the documented 400 response body', async () => {
      const error = await service
        .updateUser('admin-1', { active: false }, 'admin-1')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getStatus()).toBe(400);
      expect((error as BadRequestException).getResponse()).toEqual({
        statusCode: 400,
        message: SELF_DEACTIVATION_MESSAGE,
        error: 'Bad Request',
      });
    });

    // Scenario: Le refus d'auto-désactivation n'enregistre aucune autre modification
    it('rejects the whole record when other fields are changed along with active:false', async () => {
      const result = service.updateUser(
        'admin-1',
        {
          firstName: 'Changed',
          lastName: 'Name',
          role: 'member',
          active: false,
        },
        'admin-1',
      );

      await expect(result).rejects.toThrow(SELF_DEACTIVATION_MESSAGE);
      expect(usersRepository.findOne).not.toHaveBeenCalled();
      expect(rolesService.findById).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    // Review finding §8 (BLOCKING): MySQL case-insensitive collation lets an
    // upper-cased own UUID pass the exact-string guard and load the actor's row.
    it('rejects with 400 when the URL id differs only by case from the actor id, without saving', async () => {
      usersRepository.findOne.mockResolvedValue(
        buildUser({ id: 'admin-1', role: adminRole }),
      );

      const error = await service
        .updateUser('ADMIN-1', { active: false }, 'admin-1')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getStatus()).toBe(400);
      expect((error as BadRequestException).message).toBe(
        SELF_DEACTIVATION_MESSAGE,
      );
      expect(usersRepository.save).not.toHaveBeenCalled();
      expect(usersRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateUser — own record without deactivation', () => {
    // Scenario: Un administrateur peut modifier sa propre fiche sans se désactiver
    it('saves the change and keeps the session when active stays true', async () => {
      usersRepository.findOne.mockResolvedValue(
        buildUser({ id: 'admin-1', role: adminRole }),
      );

      const response = await service.updateUser(
        'admin-1',
        { lastName: 'Renamed', active: true },
        'admin-1',
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(savedUser()).toMatchObject({
        id: 'admin-1',
        lastName: 'Renamed',
        active: true,
        refreshTokenHash: 'session-hash',
        refreshTokenId: 'session-id',
        refreshTokenExpiresAt: SESSION_EXPIRES_AT,
      });
      expect(response).toMatchObject({
        id: 'admin-1',
        lastName: 'Renamed',
        active: true,
      });
    });

    it('saves the change when active is absent from the payload', async () => {
      usersRepository.findOne.mockResolvedValue(
        buildUser({ id: 'admin-1', role: adminRole }),
      );

      await service.updateUser('admin-1', { firstName: 'Renamed' }, 'admin-1');

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(savedUser()).toMatchObject({
        firstName: 'Renamed',
        active: true,
        refreshTokenHash: 'session-hash',
      });
    });
  });

  describe('updateUser — deactivating another account', () => {
    // Scenarios: La désactivation met fin à la session en cours /
    //            Un administrateur peut désactiver le compte d'un autre administrateur
    it.each([
      ['another administrator', adminRole],
      ['a non-admin user', memberRole],
    ])(
      'saves %s as inactive and revokes its refresh session in the same save',
      async (_label, role) => {
        usersRepository.findOne.mockResolvedValue(
          buildUser({ id: 'user-2', role }),
        );

        const response = await service.updateUser(
          'user-2',
          { active: false },
          'admin-1',
        );

        expect(usersRepository.save).toHaveBeenCalledTimes(1);
        expect(savedUser()).toMatchObject({
          id: 'user-2',
          active: false,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenExpiresAt: null,
        });
        expect(response).toMatchObject({ id: 'user-2', active: false });
        expect(response).not.toHaveProperty('refreshTokenHash');
        expect(response).not.toHaveProperty('refreshTokenId');
        expect(response).not.toHaveProperty('refreshTokenExpiresAt');
      },
    );

    // Scenario: Désactiver un compte sans session en cours
    it('deactivates an account that has no open session without error', async () => {
      usersRepository.findOne.mockResolvedValue(
        buildUser({
          id: 'user-2',
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenExpiresAt: null,
        }),
      );

      await expect(
        service.updateUser('user-2', { active: false }, 'admin-1'),
      ).resolves.toMatchObject({ id: 'user-2', active: false });
      expect(savedUser()).toMatchObject({
        active: false,
        refreshTokenHash: null,
        refreshTokenId: null,
        refreshTokenExpiresAt: null,
      });
    });
  });

  describe('updateUser — editing another account without deactivating it', () => {
    // Scenario: Modifier un compte actif sans le désactiver conserve sa session
    it('keeps the refresh session fields intact', async () => {
      usersRepository.findOne.mockResolvedValue(buildUser({ id: 'user-2' }));

      await service.updateUser('user-2', { firstName: 'Renamed' }, 'admin-1');

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(savedUser()).toMatchObject({
        firstName: 'Renamed',
        active: true,
        refreshTokenHash: 'session-hash',
        refreshTokenId: 'session-id',
        refreshTokenExpiresAt: SESSION_EXPIRES_AT,
      });
    });
  });

  describe('setRefreshTokenSession (C3)', () => {
    // Race guard: the session write must only touch an active account
    it('updates the row filtered on { id, active: true }', async () => {
      await service.setRefreshTokenSession(
        'user-1',
        'new-hash',
        'new-token-id',
        SESSION_EXPIRES_AT,
      );

      expect(usersRepository.update).toHaveBeenCalledWith(
        { id: 'user-1', active: true },
        {
          refreshTokenHash: 'new-hash',
          refreshTokenId: 'new-token-id',
          refreshTokenExpiresAt: SESSION_EXPIRES_AT,
        },
      );
    });
  });
});
