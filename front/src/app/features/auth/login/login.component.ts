import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../services/auth.service';
import { FormValidatorsService } from '../../../services/form-validators.service';
import { LoginRequest } from '../../../types/auth.types';

interface AlertMessage {
  severity: 'success' | 'error' | 'warning' | 'info';
  summary: string;
  detail: string;
}

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    CardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly formValidators = inject(FormValidatorsService);
  private readonly router = inject(Router);

  readonly form: FormGroup<{
    email: any;
    password: any;
  }> = this.fb.group({
    email: ['', [Validators.required, this.formValidators.email()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly isLoading = this.authService.isLoading;
  readonly messages = signal<AlertMessage[]>([]);

  readonly isSubmitted = signal(false);

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (!this.form.valid) {
      return;
    }

    const request: LoginRequest = this.form.getRawValue() as LoginRequest;

    this.authService.login(request).subscribe({
      next: () => {
        this.messages.set([
          {
            severity: 'success',
            summary: 'Succès',
            detail: 'Connecté avec succès',
          },
        ]);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: () => {
        this.messages.set([
          {
            severity: 'error',
            summary: 'Erreur',
            detail: this.authService.error() || 'Erreur de connexion',
          },
        ]);
      },
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${fieldName} est requis`;
    }

    if (field.errors['invalidEmail']) {
      return 'Email invalide';
    }

    if (field.errors['minlength']) {
      return `${fieldName} doit avoir au moins 8 caractères`;
    }

    return 'Erreur de validation';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
