import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/projects/project.service';
import { DateMaskDirective } from '../../../shared/directives/date-mask.directive';

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
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DateMaskDirective
  ],
  templateUrl: './project-form.component.html'
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
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(120)]],
        description: ['', [Validators.maxLength(1000)]],
        value: [0, [Validators.required, Validators.min(0)]],
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
      next: (p) => {
        this.loading = false;

        this.form.patchValue({
          name: p.name,
          description: p.description,
          value: Number(p.value),
          active: p.active,
          startDate: this.parseYmdToDate(p.startDate),
          endDate: p.endDate ? this.parseYmdToDate(p.endDate) : null
        });
      },
      error: () => {
        this.loading = false;
        this.snack.open('Falha ao carregar projeto.', 'OK', { duration: 3500 });
        this.router.navigateByUrl('/projects');
      }
    });
  }

  private parseYmdToDate(ymd: string): Date | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map((x) => Number(x));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private toYmd(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get endBeforeStart(): boolean {
    return !!this.form.errors?.['endBeforeStart'];
  }

  onCancel(): void {
    this.router.navigateByUrl('/projects');
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Verifique os campos do formulário.', 'Fechar', { duration: 3500 });
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      name: String(raw.name).trim(),
      description: String(raw.description || '').trim(),
      value: Number(raw.value),
      active: !!raw.active,
      startDate: this.toYmd(raw.startDate) as string,
      endDate: this.toYmd(raw.endDate)
    };

    this.loading = true;
    const request$ = this.isEdit && this.projectId
      ? this.projectService.update(this.projectId, payload)
      : this.projectService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Projeto salvo com sucesso', 'OK', { duration: 2500 });
        this.router.navigateByUrl('/projects');
      },
      error: (err) => {
        this.loading = false;

        const msgFromApi =
          err?.error?.message ||
          err?.error?.details?.message ||
          err?.message;

        const httpStatus = err?.status;
        const prefix =
          httpStatus === 409 ? 'Conflito: ' :
          httpStatus === 400 ? 'Validação: ' :
          httpStatus === 403 ? 'Acesso negado: ' :
          httpStatus === 401 ? 'Não autorizado: ' :
          '';

        this.snack.open(prefix + (msgFromApi || 'Falha ao salvar projeto.'), 'OK', { duration: 4500 });
      }
    });
  }
}
