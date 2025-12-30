import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordsMatchValidator] }
  );

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Preencha corretamente os campos.', 'OK', { duration: 2500 });
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading = true;

    this.auth.register({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Usuário cadastrado com sucesso!', 'OK', { duration: 2500 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          'Falha ao cadastrar. Verifique os dados e tente novamente.';
        this.snack.open(msg, 'OK', { duration: 3500 });
      },
    });
  }
}
