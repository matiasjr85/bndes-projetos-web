import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Project, ProjectService } from '../../../core/projects/project.service';

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
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent {
  loading = false;
  isEdit = false;
  projectId: number | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      value: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      startDate: [null, Validators.required], 
      endDate: [null, Validators.required],   
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.projectId = Number(idParam);
      this.loadProject(this.projectId);
    }
  }

  private loadProject(id: number) {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name,
          description: p.description,
          value: typeof p.value === 'string' ? Number(p.value) : p.value,
          active: p.active,
          startDate: this.parseYmd(p.startDate),
          endDate: this.parseYmd(p.endDate),
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Falha ao carregar projeto', 'Fechar', { duration: 4000 });
        this.router.navigateByUrl('/projects');
      },
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: Partial<Project> = {
      name: raw.name,
      description: raw.description,
      value: raw.value,
      active: raw.active,
      startDate: this.toYmd(raw.startDate),
      endDate: this.toYmd(raw.endDate),
    };

    this.loading = true;

    const req$ = this.isEdit && this.projectId
      ? this.service.update(this.projectId, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open(this.isEdit ? 'Projeto atualizado' : 'Projeto criado', 'Fechar', { duration: 3000 });
        this.router.navigateByUrl('/projects');
      },
      error: () => {
        this.loading = false;
        this.snack.open('Falha ao salvar projeto', 'Fechar', { duration: 4000 });
      },
    });
  }

  cancel() {
    this.router.navigateByUrl('/projects');
  }

  private toYmd(d: Date | null): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    }

  private parseYmd(ymd: string): Date | null {
    // espera "YYYY-MM-DD"
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
}