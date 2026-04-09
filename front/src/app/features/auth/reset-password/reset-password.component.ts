import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs';
import { ResetPasswordDtoRequest } from '../../../repositories/auth/auth.model';
import { AuthRepository } from '../../../repositories/auth/auth.repository';
import { FormValidatorsService } from '../../../services/form-validators.service';
import { ResetPasswordForm, ResetPasswordFormValue } from './models/reset-password.model';

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    CardModule,
    MessageModule,
    ToastModule,
    TranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authRepository = inject(AuthRepository);
  private readonly formValidators = inject(FormValidatorsService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form: FormGroup<ResetPasswordForm> = this.fb.group(
    {
      tempPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.formValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [
        this.formValidators.passwordMatch('newPassword', 'confirmPassword'),
      ],
    }
  );

  protected readonly isLoading = signal(false);
  protected readonly tempToken = signal<string>('');

  protected readonly passwordStrengthIndicator = signal({ score: 0, text: '' });

  constructor() {
    effect(() => {
      const newPassword = this.form.controls.newPassword?.value as string;
      this.updatePasswordStrength(newPassword);
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['token']) {
        this.tempToken.set(params['token']);
      }
    });
  }

  onSubmit(): void {
    this.isLoading.set(true);

    if (this.form.invalid || !this.tempToken()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Formulaire invalide ou lien expiré',
      });
      return;
    }

    const formValue : ResetPasswordFormValue = this.form.value as ResetPasswordFormValue;
    const request: ResetPasswordDtoRequest = {
      tempPassword: formValue.tempPassword,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword,
    };

    this.authRepository.resetPassword(request)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.router.navigate(['/auth/login']);
      });
  }

  protected getPasswordStrengthClass(): string {
    const score = this.passwordStrengthIndicator().score;

    switch (score) {
      case 0:
      case 1:
        return 'strength-weak';
      case 2:
        return 'strength-fair';
      case 3:
        return 'strength-good';
      case 4:
        return 'strength-strong';
      case 5:
        return 'strength-excellent';
      default:
        return '';
    }
  }

  private updatePasswordStrength(password: string): void {
    let score = 0;
    let text = '';

    if (!password) {
      this.passwordStrengthIndicator.set({ score: 0, text: '' });
      return;
    }

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 1) {
      text = 'Faible';
    } else if (score <= 2) {
      text = 'Moyen';
    } else if (score <= 3) {
      text = 'Bon';
    } else if (score <= 4) {
      text = 'Très bon';
    } else {
      text = 'Excellent';
    }

    this.passwordStrengthIndicator.set({ score, text });
  }
}
