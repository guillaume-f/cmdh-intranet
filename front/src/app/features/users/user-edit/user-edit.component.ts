import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/auth/user-role.type';
import { UsersRepository } from '../../../repositories/users/users.repository';
import { UserEditFormValue } from './models/user-edit-form.model';
import { UserEditFormService } from './user-edit-form.service';

@Component({
  selector: 'app-user-edit',
  providers: [UserEditFormService],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BreadcrumbModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './user-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly usersRepository = inject(UsersRepository);
  private readonly userEditFormService = inject(UserEditFormService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly userId = signal(this.activatedRoute.snapshot.paramMap.get('userId') ?? '');
  private readonly isEditMode = computed(() => !!this.userId());
  private readonly userName = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly entryYearMin = 1985;
  protected readonly entryYearMax = new Date().getFullYear();

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: 'Administrateur', value: 'admin' },
    { label: 'Encodeur', value: 'encoder' },
    { label: 'Membre', value: 'member' },
    { label: 'Candidat', value: 'candidate' },
  ];

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: 'Utilisateurs', routerLink: '/users' },
    { label: this.isEditMode() ? (this.userName() || 'Modification utilisateur') : 'Nouvel utilisateur' },
  ]);

  protected readonly pageTitle = computed(() => this.isEditMode() ? 'Modification utilisateur' : 'Nouvel utilisateur');
  protected readonly submitLabel = computed(() => this.isEditMode() ? 'Enregistrer' : 'Créer');
  protected readonly cancelLink = computed<(string | number)[]>(() => this.isEditMode() ? ['/users', this.userId()] : ['/users']);

  protected readonly form = this.userEditFormService.buildForm();

  ngOnInit(): void {
    if (this.authService.userRole() !== 'admin') {
      void this.router.navigate(['/users']);
      return;
    }

    if (this.isEditMode()) {
      this.loadUser();
    }

  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.getRawValue() as UserEditFormValue;

    const request$ = this.isEditMode() && this.userId()
      ? this.usersRepository.updateUser(this.userId(), formValue)
      : this.usersRepository.addUser(formValue);

    request$.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe((savedUser) => {
      void this.router.navigate(['/users', savedUser.id]);
    });
  }

  private loadUser(): void {
    if (!this.userId()) {
      return;
    }

    this.isLoading.set(true);

    this.usersRepository.getUserById(this.userId()).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe((user) => {
      this.userName.set(`${user.firstName} ${user.lastName}`.trim());
      this.userEditFormService.patchValue(this.form, user);
    });
  }
}
