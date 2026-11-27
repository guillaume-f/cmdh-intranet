import { Test } from '@nestjs/testing';
import { RolesService } from '../roles/roles.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserPayloadDto } from './dto/user-payload.dto';

// US-001 · C4 — the controller passes the caller identity (req.user.id) as actorId.
describe('UsersController (US-001 C4)', () => {
  let controller: UsersController;
  let usersService: { updateUser: jest.Mock };

  beforeEach(async () => {
    usersService = { updateUser: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        // Guards are instantiated by Nest but not exercised (handler called directly).
        { provide: RolesService, useValue: {} },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  // Scenarios: Le serveur refuse qu'un administrateur désactive son propre compte (actor wiring) /
  //            Un administrateur peut désactiver le compte d'un autre administrateur
  it('forwards userId, payload and req.user.id as actorId to UsersService.updateUser', async () => {
    const payload: UserPayloadDto = { active: false, firstName: 'Jane' };
    const serviceResponse = { id: 'user-2', active: false };
    usersService.updateUser.mockResolvedValue(serviceResponse);

    const result = await controller.updateUser('user-2', payload, {
      user: { id: 'admin-1' } as User,
    });

    expect(usersService.updateUser).toHaveBeenCalledTimes(1);
    expect(usersService.updateUser).toHaveBeenCalledWith(
      'user-2',
      payload,
      'admin-1',
    );
    expect(result).toBe(serviceResponse);
  });

  it('forwards the caller id even when editing their own record', async () => {
    const payload: UserPayloadDto = { active: false };
    usersService.updateUser.mockResolvedValue({ id: 'admin-1' });

    await controller.updateUser('admin-1', payload, {
      user: { id: 'admin-1' } as User,
    });

    expect(usersService.updateUser).toHaveBeenCalledWith(
      'admin-1',
      payload,
      'admin-1',
    );
  });
});
