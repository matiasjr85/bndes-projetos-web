import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Project, ProjectService } from '../../../core/projects/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = false;

  displayedColumns: string[] = ['id', 'name', 'value', 'active', 'startDate', 'endDate', 'actions'];
  data: Project[] = [];

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  // ✅ agora não usamos this.fb aqui fora
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ProjectService,
    private snack: MatSnackBar
  ) {
    // ✅ inicializa o form depois que fb existe
    this.form = this.fb.group({
      q: [''],
      active: [null as null | boolean],
      sort: ['id,desc'],
    });

    this.load();
  }

  load(pageIndex = this.pageIndex, pageSize = this.pageSize) {
    const { q, active, sort } = this.form.getRawValue();

    this.loading = true;
    this.service
      .list({
        q: q || undefined,
        active: active === null ? undefined : active,
        page: pageIndex,
        size: pageSize,
        sort: sort || 'id,desc',
      })
      .subscribe({
        next: (res) => {
          this.data = res.content ?? [];
          this.totalElements = res.totalElements ?? 0;
          this.pageIndex = res.number ?? pageIndex;
          this.pageSize = res.size ?? pageSize;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snack.open('Falha ao carregar projetos (401? token?)', 'Fechar', { duration: 4000 });
        },
      });
  }

  applyFilters() {
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
    this.load(0, this.pageSize);
  }

  onPage(e: PageEvent) {
    this.load(e.pageIndex, e.pageSize);
  }
}
