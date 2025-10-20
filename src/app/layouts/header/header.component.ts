import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, type OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UserState } from '@app/state/UserState';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokenService } from '@app/core/services/auth/token.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  constructor(
    private userState: UserState,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  readonly user = computed(() => {
    const current = this.userState.currentUser();
    return {
      email: current?.email ?? 'Usuario',
      role: current?.role ?? 'Administrador',
    };
  });

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada');
        this.tokenService.clearTokens();
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Error al cerrar sesión', err),
    });
  }
}
