import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Project, ProjectService } from '../../../core/projects/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  loading = false;
  projectId!: number;
  project: Project | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProjectService,
    private snack: MatSnackBar
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || isNaN(Number(idParam))) {
      this.snack.open('ID inválido', 'Fechar', { duration: 3000 });
      this.router.navigateByUrl('/projects');
      return;
    }

    this.projectId = Number(idParam);
    this.load();
  }

  load() {
    this.loading = true;

    this.service.getById(this.projectId).subscribe({
      next: (p) => {
        this.project = p;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Falha ao carregar projeto', 'Fechar', { duration: 4000 });
        this.router.navigateByUrl('/projects');
      },
    });
  }

  back() {
    this.router.navigateByUrl('/projects');
  }

  edit() {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }
}