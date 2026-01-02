import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  hidePassword = true;
  hideConfirm = true;
  loading = false;

  private readonly passwordStrengthValidatorFn: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (/\s/.test(value)) errors['hasWhitespace'] = true;
    if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
    if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
    if (!/\d/.test(value)) errors['noNumber'] = true;
    if (!/[^A-Za-z\d]/.test(value)) errors['noSpecial'] = true;

    return Object.keys(errors).length ? errors : null;
  };

  private readonly passwordsMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;

    if (!pass || !confirm) return null;
    return pass === confirm ? null : { passwordsMismatch: true };
  };

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          this.passwordStrengthValidatorFn,
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordsMatchValidator] }
  );

  private extractBackendValidationMessage(err: any): string | null {
    const fieldErrors = err?.error?.details?.fieldErrors;
    if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) return null;

    const msgs = fieldErrors
      .map((e: any) => e?.message)
      .filter((m: any) => typeof m === 'string' && m.trim().length > 0);

    if (!msgs.length) return null;

    return Array.from(new Set(msgs)).join(' ');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Preencha corretamente os campos.', 'OK', { duration: 2500 });
      return;
    }

    const email = String(this.form.get('email')?.value ?? '');
    const password = String(this.form.get('password')?.value ?? '');

    this.loading = true;

    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Usuário cadastrado com sucesso!', 'OK', { duration: 2500 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;

        const backendMsg =
          this.extractBackendValidationMessage(err) ||
          err?.error?.message ||
          err?.error?.error;

        this.snack.open(
          backendMsg || 'Falha ao cadastrar. Verifique os dados e tente novamente.',
          'OK',
          { duration: 4500 }
        );
      },
    });
  }
}
