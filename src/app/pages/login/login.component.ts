import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  private returnUrl = '/projects';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    const rawReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = this.sanitizeReturnUrl(rawReturnUrl) || '/projects';

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.snack.open('Sua sessão expirou. Faça login novamente.', 'Fechar', {
        duration: 3500,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Preencha email e senha válidos.', 'Fechar', { duration: 2500 });
      return;
    }

    const { email, password } = this.form.value;

    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => { /* snackbar */ }
    });
  }
  
  private sanitizeReturnUrl(value: string | null): string | null {
    if (!value) return null;

    const trimmed = value.trim();
    
    if (/^([a-zA-Z][a-zA-Z0-9+.-]*:)?\/\//.test(trimmed)) return null;
    if (!trimmed.startsWith('/')) return null;

    return trimmed;
  }
}
