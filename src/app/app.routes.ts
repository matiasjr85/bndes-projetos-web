import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // depois você cria register e projects
  // { path: 'register', component: RegisterComponent },
  // { path: 'projects', canActivate: [authGuard], component: ProjectListComponent },

  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
