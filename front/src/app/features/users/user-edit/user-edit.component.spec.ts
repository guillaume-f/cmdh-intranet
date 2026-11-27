import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { providePrimeNG } from 'primeng/config';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserDto } from '../../../core/auth/user.model';
import { UsersRepository } from '../../../repositories/users/users.repository';
import { UserEditComponent } from './user-edit.component';

// US-001 · C5 — "Compte actif" switch locked on the admin's own record.
describe('UserEditComponent (US-001 C5)', () => {
  const ADMIN_ID = 'admin-1';
  const OTHER_ID = 'user-2';
  const HELP_ID = 'active-self-locked-help';

  const buildUser = (overrides: Partial<UserDto> = {}): UserDto => ({
    id: OTHER_ID,
    email: 'user2@example.test',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'admin',
    extraPermissions: [],
    deniedPermissions: [],
    permissions: [],
    active: true,
    niss: '12345678901',
    entryYear: 2020,
    ...overrides,
  });

  const currentAdmin = buildUser({ id: ADMIN_ID, email: 'admin@example.test', firstName: 'Ada' });

  let usersRepository: {
    getUserById: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    addUser: ReturnType<typeof vi.fn>;
  };

  async function setup(routeUserId: string | null, loadedUser?: UserDto) {
    usersRepository = {
      getUserById: vi.fn().mockReturnValue(of(loadedUser ?? buildUser())),
      updateUser: vi.fn((id: string) => of(buildUser({ id }))),
      addUser: vi.fn().mockReturnValue(of(buildUser({ id: 'new-user' }))),
    };

    const currentUser = signal<UserDto | null>(currentAdmin);
    const authServiceStub = {
      currentUser,
      userRole: () => currentUser()?.role ?? null,
    };

    await TestBed.configureTestingModule({
      imports: [UserEditComponent],
      providers: [
        provideRouter([]),
        providePrimeNG(),
        provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
        { provide: AuthService, useValue: authServiceStub },
        { provide: UsersRepository, useValue: usersRepository },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeUserId ? { userId: routeUserId } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(UserEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  const activeInput = (fixture: ComponentFixture<UserEditComponent>): HTMLInputElement => {
    const input = fixture.nativeElement.querySelector('#active') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    return input as HTMLInputElement;
  };

  const activeControl = (fixture: ComponentFixture<UserEditComponent>) =>
    fixture.componentInstance['form'].controls.active;

  const helpText = (fixture: ComponentFixture<UserEditComponent>): HTMLElement | null =>
    fixture.nativeElement.querySelector(`#${HELP_ID}`);

  const clickSwitch = async (fixture: ComponentFixture<UserEditComponent>) => {
    const host = fixture.nativeElement.querySelector('p-toggleswitch') as HTMLElement;
    const clickable = (host.querySelector('.p-toggleswitch') as HTMLElement | null) ?? host;
    clickable.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const submit = async (fixture: ComponentFixture<UserEditComponent>) => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('own record (/users/<own id>/edit)', () => {
    // Scenario: L'interrupteur « Compte actif » est verrouillé sur sa propre fiche
    it('shows the switch checked and disabled', async () => {
      const fixture = await setup(ADMIN_ID, currentAdmin);

      expect(activeControl(fixture).disabled).toBe(true);
      expect(activeControl(fixture).value).toBe(true);
      expect(activeInput(fixture).disabled).toBe(true);
      expect(activeInput(fixture).checked).toBe(true);
    });

    it('cannot be toggled by clicking', async () => {
      const fixture = await setup(ADMIN_ID, currentAdmin);

      await clickSwitch(fixture);

      expect(activeControl(fixture).value).toBe(true);
      expect(activeInput(fixture).checked).toBe(true);
    });

    it('shows the help text linked to the switch input via aria-describedby', async () => {
      const fixture = await setup(ADMIN_ID, currentAdmin);

      const help = helpText(fixture);
      expect(help).not.toBeNull();
      expect(help?.textContent?.trim()).not.toBe('');
      expect(activeInput(fixture).getAttribute('aria-describedby')).toBe(HELP_ID);
    });

    // Scenario: Un administrateur peut modifier sa propre fiche sans se désactiver (F2 constraint)
    it('still sends active: true on submit although the switch is disabled', async () => {
      const fixture = await setup(ADMIN_ID, currentAdmin);
      fixture.componentInstance['form'].controls.lastName.setValue('Renamed');

      await submit(fixture);

      expect(usersRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(usersRepository.updateUser).toHaveBeenCalledWith(
        ADMIN_ID,
        expect.objectContaining({ lastName: 'Renamed', active: true }),
      );
    });
  });

  describe("another user's record (/users/<other id>/edit)", () => {
    // Scenario: L'interrupteur « Compte actif » reste modifiable sur la fiche d'un autre utilisateur
    it('keeps the switch enabled, without help text nor aria-describedby', async () => {
      const fixture = await setup(OTHER_ID, buildUser({ id: OTHER_ID }));

      expect(activeControl(fixture).enabled).toBe(true);
      expect(activeInput(fixture).disabled).toBe(false);
      expect(helpText(fixture)).toBeNull();
      expect(activeInput(fixture).hasAttribute('aria-describedby')).toBe(false);
    });

    // Scenario: Un administrateur peut désactiver le compte d'un autre administrateur (UI side)
    it('lets the admin toggle the switch off and submits active: false', async () => {
      const fixture = await setup(OTHER_ID, buildUser({ id: OTHER_ID, role: 'admin' }));

      await clickSwitch(fixture);
      expect(activeControl(fixture).value).toBe(false);

      await submit(fixture);

      expect(usersRepository.updateUser).toHaveBeenCalledWith(
        OTHER_ID,
        expect.objectContaining({ active: false }),
      );
    });
  });

  describe('creation (/users/new)', () => {
    // F4 non-regression
    it('keeps the switch enabled without help text', async () => {
      const fixture = await setup(null);

      expect(usersRepository.getUserById).not.toHaveBeenCalled();
      expect(activeControl(fixture).enabled).toBe(true);
      expect(activeInput(fixture).disabled).toBe(false);
      expect(helpText(fixture)).toBeNull();
    });
  });
});
