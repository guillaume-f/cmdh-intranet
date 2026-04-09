import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
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
import { AuthService } from '../../../services/auth.service';
import { FormValidatorsService } from '../../../services/form-validators.service';
import { ResetPasswordRequest } from '../../../types/auth.types';

interface ResetPasswordForm {
  tempPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
  private readonly authService = inject(AuthService);
  private readonly formValidators = inject(FormValidatorsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  protected readonly form: FormGroup<{
    tempPassword: any;
    newPassword: any;
    confirmPassword: any;
  }> = this.fb.group(
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

  protected readonly isLoading = this.authService.isLoading;
  protected readonly isSubmitted = signal(false);
  protected readonly tempToken = signal<string>('');

  protected readonly passwordStrengthIndicator = signal({ score: 0, text: '' });

  constructor() {
    effect(() => {
      const newPassword = this.form.get('newPassword')?.value as string;
      this.updatePasswordStrength(newPassword);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.tempToken.set(params['token']);
      }
    });
  }

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (!this.form.valid || !this.tempToken()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Formulaire invalide ou lien expiré',
      });
      return;
    }

    const formValue = this.form.getRawValue() as {
      tempPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
    const request: ResetPasswordRequest = {
      tempPassword: formValue.tempPassword,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword,
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Mot de passe réinitialisé avec succès',
          life: 3000,
        });

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.authService.error() || 'Erreur lors de la réinitialisation',
        });
      },
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
