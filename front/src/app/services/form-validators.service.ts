import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormValidatorsService {
  /**
   * Validates password strength
   * Requirements: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        value
      );
      const isLongEnough = value.length >= 8;

      const passwordValid =
        hasUpperCase &&
        hasLowerCase &&
        hasNumeric &&
        hasSpecialChar &&
        isLongEnough;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            isLongEnough,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validates password match between two fields
   */
  passwordMatch(passwordField: string, confirmField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirm = control.get(confirmField);

      if (!password || !confirm) {
        return null;
      }

      if (confirm.errors?.['passwordMismatch']) {
        delete confirm.errors['passwordMismatch'];
        confirm.updateValueAndValidity({ emitEvent: false });
      }

      if (password.value !== confirm.value) {
        confirm.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirm.updateValueAndValidity({ emitEvent: false });
      }

      return null;
    };
  }
}
