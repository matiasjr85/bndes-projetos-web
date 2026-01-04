import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProjectService } from '../../../core/projects/project.service';

function dateRequiredValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value == null) return { required: true };
  if (!(value instanceof Date)) return { invalidDate: true };
  if (isNaN(value.getTime())) return { invalidDate: true };
  return null;
}

function validOptionalDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value == null || value === '') return null;
  if (!(value instanceof Date)) return { invalidDate: true };
  if (isNaN(value.getTime())) return { invalidDate: true };
  return null;
}

function endDateAfterStartValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value as Date | null;
  const end = group.get('endDate')?.value as Date | null;

  if (!start || !end) return null;
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  if (end.getTime() < start.getTime()) return { endBeforeStart: true };
  return null;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  projectId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(120)]],
        description: ['', [Validators.maxLength(1000)]],
        value: [null, [Validators.required, Validators.min(0)]],
        active: [true],
        startDate: [null, [dateRequiredValidator]],
        endDate: [null, [validOptionalDateValidator]]
      },
      { validators: [endDateAfterStartValidator] }
    );

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.projectId = Number(idParam);
      this.loadProject(this.projectId);
    }
  }

  private loadProject(id: number): void {
    this.loading = true;

    this.projectService.getById(id).subscribe({
      next: (project) => {
        // ajuste conforme o seu modelo real
        this.form.patchValue({
          name: project.name,
          description: project.description,
          value: project.value,
          active: project.active,
          startDate: project.startDate ? new Date(project.startDate) : null,
          endDate: project.endDate ? new Date(project.endDate) : null
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Não foi possível carregar o projeto.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/projects']);
      }
    });
  }

  onSubmit(): void {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Verifique os campos do formulário.', 'Fechar', { duration: 3000 });
      return;
    }

    const payload = this.buildPayload();

    this.loading = true;

    const req$ = this.isEdit && this.projectId != null
      ? this.projectService.update(this.projectId, payload)
      : this.projectService.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Projeto salvo com sucesso.', 'Fechar', { duration: 2500 });
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Não foi possível salvar o projeto.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private buildPayload(): any {
    const v = this.form.value;

    // Mantém Date como Date aqui; se sua API espera string (yyyy-MM-dd),
    // ajuste aqui para serializar.
    return {
      name: v.name,
      description: v.description,
      value: v.value,
      active: v.active,
      startDate: v.startDate,
      endDate: v.endDate
    };
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
