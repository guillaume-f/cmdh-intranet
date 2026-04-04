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
  Validators
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
import { LoginRequest } from '../../../types/auth.types';

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
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
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

  readonly isSubmitted = signal(false);

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: LoginRequest = this.form.getRawValue() as LoginRequest;

    this.authService.login(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Connecté avec succès',
          life: 1500,
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.authService.error() || 'Erreur de connexion',
        });
      },
    });
  }


}
