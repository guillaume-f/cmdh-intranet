import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';
import { FormValidatorsService } from '../../../services/form-validators.service';
import { ForgotPasswordRequest } from '../../../types/auth.types';

interface ForgotPasswordForm {
  email: string;
}

@Component({
  selector: 'app-forgot-password',
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
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly formValidators = inject(FormValidatorsService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly form: FormGroup<{
    email: any;
  }> = this.fb.group({
    email: ['', [Validators.required, this.formValidators.email()]],
  });

  readonly isLoading = this.authService.isLoading;
  readonly isSubmitted = signal(false);
  readonly isEmailSent = signal(false);

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (!this.form.valid) {
      return;
    }

    const request: ForgotPasswordRequest = this.form.getRawValue() as ForgotPasswordRequest;

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.isEmailSent.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Un email de réinitialisation a été envoyé à votre adresse',
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
          detail:
            this.authService.error() || 'Erreur lors de la demande',
        });
      },
    });
  }

  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Ce champ est requis';
    }

    if (control.errors['invalidEmail']) {
      return 'Email invalide';
    }

    return 'Erreur de validation';
  }

  isFieldInvalid(control: AbstractControl | null): boolean {
    return control ? control.invalid && control.touched : false;
  }
}
