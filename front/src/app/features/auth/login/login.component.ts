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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../types/auth.types';
import { EMAIL_PATTERN } from '../../../utilities/patterns';
import { TypedControlsOf } from '../../../utilities/typed-controls';

interface LoginFormValue {
  email: string;
  password: string;
}

type LoginForm = TypedControlsOf<LoginFormValue>;

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
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly translateService = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly form: FormGroup<LoginForm> = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly isLoading = this.authService.isLoading;

  protected readonly isSubmitted = signal(false);

  constructor() {
    // TODO : en attente deploy https://github.com/ngx-translate/core/milestone/3 
    this.translateService.use('fr')
  }

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
