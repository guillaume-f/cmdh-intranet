import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { finalize } from 'rxjs';
import { LoginDtoRequest } from '../../../repositories/auth/auth.model';
import { AuthRepository } from '../../../repositories/auth/auth.repository';
import { EMAIL_PATTERN } from '../../../utilities/patterns';
import { LoginForm } from './models/login.model';

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
  private readonly authRepository = inject(AuthRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form: FormGroup<LoginForm> = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly isLoading = signal(false);

  constructor() {
    // TODO : en attente deploy https://github.com/ngx-translate/core/milestone/3 
    this.translateService.use('fr')
  }

  onSubmit(): void {
    this.isLoading.set(true);

    if (this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: LoginDtoRequest = this.form.value as LoginDtoRequest;

    this.authRepository.login(request)
    .pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.router.navigate(['/dashboard']);
      });
    }
}
