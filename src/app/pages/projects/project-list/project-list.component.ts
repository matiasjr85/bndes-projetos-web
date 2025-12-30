import { Component, ViewChild, Inject } from '@angular/core';
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
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project, ProjectService } from '../../../core/projects/project.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>{{ data.message }}</div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">Excluir</button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}
}

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
    MatDialogModule,
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

  form!: FormGroup;

  private deletingIds = new Set<number>();

  constructor(
  private fb: FormBuilder,
  private service: ProjectService,
  private snack: MatSnackBar,
  private dialog: MatDialog
) {
  this.form = this.fb.group({
    q: [''],
    active: [null as null | boolean],
    sort: ['id,desc'],
  });
  
  this.form.get('active')?.valueChanges.subscribe(() => {
    this.applyFilters();
  });

  this.form.get('sort')?.valueChanges.subscribe(() => {
    this.applyFilters();
  });

  this.load();
}

  isDeleting(id: number): boolean {
    return this.deletingIds.has(id);
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
          this.snack.open('Falha ao carregar projetos. Tente novamente.', 'Fechar', { duration: 4000 });
        },
      });
  }

  applyFilters() {
  console.log('applyFilters clicado', this.form.getRawValue());
  this.pageIndex = 0;
  if (this.paginator) this.paginator.firstPage();
  this.load(0, this.pageSize);
}

  onPage(e: PageEvent) {
    this.load(e.pageIndex, e.pageSize);
  }

  onDelete(p: Project) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Excluir projeto',
        message: `Deseja realmente excluir o projeto ${p?.name ? `"${p.name}"` : `#${p.id}`}?`,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.deletingIds.add(p.id);
      
      this.service.delete(p.id).subscribe({
        next: () => {
          this.snack.open('Projeto excluído com sucesso.', 'Fechar', { duration: 2500 });

          if ((this.data?.length ?? 0) === 1 && this.pageIndex > 0) {
            this.pageIndex = this.pageIndex - 1;
          }

          this.load(this.pageIndex, this.pageSize);
        },
        error: () => {
          this.snack.open('Falha ao excluir projeto. Tente novamente.', 'Fechar', { duration: 3000 });
        },
        complete: () => {
          this.deletingIds.delete(p.id);
        },
      });
    });
  }
}
