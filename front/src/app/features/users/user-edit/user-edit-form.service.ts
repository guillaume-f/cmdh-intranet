import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '../../../core/auth/user-role.type';
import { UserDto } from '../../../core/auth/user.model';
import { EMAIL_PATTERN, NISS_PATTERN } from '../../../utilities/patterns';
import { UserEditForm } from './models/user-edit-form.model';

@Injectable()
export class UserEditFormService {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly entryYearMin = 1985;
  private readonly entryYearMax = new Date().getFullYear();

  buildForm(): FormGroup<UserEditForm> {
    const form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      niss: ['', [Validators.required, Validators.pattern(NISS_PATTERN)]],
      role: ['member' as UserRole, [Validators.required]],
      active: [true],
    });

    this.onFormChanges(form);

    return form;
  }

  private onFormChanges(form: FormGroup<UserEditForm>): void {
    this.updateEntryYearConstraints(form, form.controls.role.value);

    form.controls.role.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((role) => {
        this.updateEntryYearConstraints(form, role);
      });
  }

  patchValue(form: FormGroup<UserEditForm>, user: UserDto): void {
    form.patchValue(user);
  }

  private updateEntryYearConstraints(form: FormGroup<UserEditForm>, role: UserRole | null): void {
    if (role === 'candidate') {
      if (form.controls.entryYear) {
        form.removeControl('entryYear');
      }
    } else {
      const validators = [Validators.required, Validators.min(this.entryYearMin), Validators.max(this.entryYearMax)];

      if (!form.controls.entryYear) {
        form.addControl('entryYear', new FormControl<number | null>(null, validators));
      } else {
        form.controls.entryYear.setValidators(validators);
        form.controls.entryYear.updateValueAndValidity({ emitEvent: false });
      }
    }
  }
}
