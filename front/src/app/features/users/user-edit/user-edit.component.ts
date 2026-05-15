import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/auth/user-role.type';
import { UsersRepository } from '../../../repositories/users/users.repository';
import { EMAIL_PATTERN } from '../../../utilities/patterns';

@Component({
  selector: 'app-user-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BreadcrumbModule,
    InputTextModule,
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly userId = signal(this.activatedRoute.snapshot.paramMap.get('userId') ?? '');
  protected readonly isEditMode = computed(() => !!this.userId());
  protected readonly userName = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);

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

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    niss: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    role: ['member' as UserRole, [Validators.required]],
    active: [true],
  });

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

    const request$ = this.isEditMode() && this.userId()
      ? this.usersRepository.updateUser(this.userId(), this.form.getRawValue())
      : this.usersRepository.addUser(this.form.getRawValue());

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
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        niss: user.niss,
        role: user.role,
        active: user.active,
      });
    });
  }
}
