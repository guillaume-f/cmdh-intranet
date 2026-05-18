import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly usersRepository = inject(UsersRepository);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly userId = signal(this.activatedRoute.snapshot.paramMap.get('userId') ?? '');
  private readonly isEditMode = computed(() => !!this.userId());
  private readonly userName = signal('');
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
    entryYear: ['', [Validators.pattern(/^\d{4}$/)]],
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

    this.setupEntryYearConstraints();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const rawValue = this.form.getRawValue();
    const request = {
      ...rawValue,
      entryYear: rawValue.role === 'candidate' ? null : Number(rawValue.entryYear),
    };

    const request$ = this.isEditMode() && this.userId()
      ? this.usersRepository.updateUser(this.userId(), request)
      : this.usersRepository.addUser(request);

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
        entryYear: user.entryYear ? String(user.entryYear) : '',
        role: user.role,
        active: user.active,
      });
    });
  }

  private setupEntryYearConstraints(): void {
    this.updateEntryYearConstraints(this.form.controls.role.value);

    this.form.controls.role.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => this.updateEntryYearConstraints(role));
  }

  private updateEntryYearConstraints(role: UserRole): void {
    if (role === 'candidate') {
      this.form.controls.entryYear.setValue('');
      this.form.controls.entryYear.clearValidators();
      this.form.controls.entryYear.disable({ emitEvent: false });
    } else {
      this.form.controls.entryYear.enable({ emitEvent: false });
      this.form.controls.entryYear.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
    }

    this.form.controls.entryYear.updateValueAndValidity();
  }
}
