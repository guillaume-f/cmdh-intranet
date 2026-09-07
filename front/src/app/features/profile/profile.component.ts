import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileRepository } from '../../repositories/profile/profile.repository';
import { FormValidatorsService } from '../../services/form-validators.service';
import { EMAIL_PATTERN } from '../../utilities/patterns';
import { PageHeaderComponent } from '../shell/page-header.component';
import { ProfilePasswordForm } from './profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BreadcrumbModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    PageHeaderComponent,
  ],
  providers: [FormValidatorsService],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileRepository = inject(ProfileRepository);
  private readonly formValidators = inject(FormValidatorsService);
  private readonly router = inject(Router);

  protected readonly isSavingEmail = signal(false);
  protected readonly isSavingPassword = signal(false);
  protected readonly emailSuccessMessage = signal('');
  protected readonly emailErrorMessage = signal('');
  protected readonly passwordSuccessMessage = signal('');
  protected readonly passwordErrorMessage = signal('');

  protected readonly emailControl: FormControl<string> = this.fb.nonNullable.control('', [
    Validators.required,
    Validators.pattern(EMAIL_PATTERN),
  ]);

  protected readonly passwordForm: FormGroup<ProfilePasswordForm> = this.fb.group(
    {
      currentPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [
        Validators.required,
        this.formValidators.passwordStrength(),
      ]),
      confirmPassword: this.fb.control('', [Validators.required]),
    },
    {
      // validators: [this.formValidators.passwordMatch('newPassword', 'confirmPassword')],
    },
  );

  constructor() {
    const user = this.authService.currentUser();

    if (!user) {
      void this.router.navigate(['/auth/login']);
      return;
    }

    this.emailControl.patchValue(user.email);
  }

  protected onSubmitEmail(): void {
    const user = this.authService.currentUser();

    this.emailSuccessMessage.set('');
    this.emailErrorMessage.set('');

    if (!user) {
      this.emailErrorMessage.set('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }

    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    this.isSavingEmail.set(true);

    this.profileRepository
      .updateEmail(this.emailControl.value)
      .pipe(finalize(() => this.isSavingEmail.set(false)))
      .subscribe({
        next: (updatedUser) => {
          // this.authService.setUser(this.mergeUser(user, updatedUser));
          this.emailSuccessMessage.set('Adresse email mise a jour avec succes.');
        },
        error: () => {
          this.emailErrorMessage.set("Impossible de mettre a jour l'email pour le moment.");
        },
      });
  }

  protected onSubmitPassword(): void {
    const user = this.authService.currentUser();

    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');

    if (!user) {
      this.passwordErrorMessage.set('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword.set(true);

    // this.profileRepository
    //   .updatePassword(
    //     this.passwordForm.controls.currentPassword.value,
    //     this.passwordForm.controls.newPassword.value,
    //   )
    //   .pipe(finalize(() => this.isSavingPassword.set(false)))
    //   .subscribe({
    //     next: () => {
    //       this.passwordSuccessMessage.set('Mot de passe mis a jour avec succes.');
    //       this.passwordForm.reset({
    //         currentPassword: '',
    //         newPassword: '',
    //         confirmPassword: '',
    //       });
    //     },
    //     error: () => {
    //       this.passwordErrorMessage.set(
    //         'Impossible de mettre a jour le mot de passe pour le moment.',
    //       );
    //     },
    //   });
  }
}
