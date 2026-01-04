import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout(): void {
    // 1) Remove token local imediatamente (UX)
    this.auth.logout();
    this.router.navigateByUrl('/login');

    // 2) Tenta invalidar tokens no backend (blacklist/revogação)
    this.auth.logoutRemote().subscribe({ error: () => {} });
  }
}
