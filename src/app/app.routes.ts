import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ProjectListComponent } from './pages/projects/project-list/project-list.component';
import { ProjectFormComponent } from './pages/projects/project-form/project-form.component';
import { ProjectDetailComponent } from './pages/projects/project-detail/project-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'projects',
        children: [
          { path: '', component: ProjectListComponent },
          { path: 'new', component: ProjectFormComponent },
          { path: ':id/edit', component: ProjectFormComponent },
          { path: ':id', component: ProjectDetailComponent },
        ],
      },

      { path: '', redirectTo: 'projects', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'projects' },
];