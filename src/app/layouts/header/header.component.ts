import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, type OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UserState } from '@app/state/UserState';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokenService } from '@app/core/services/auth/token.service';
import { ROLE_LABELS } from '@app/core/consts/user.roles.consts';
import { Subject, takeUntil } from 'rxjs';

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
export class HeaderComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private userState: UserState,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  readonly user = computed(() => {
    const current = this.userState.currentUser();

    const roleKey = current?.role ?? 'admin';
    const roleLabel = ROLE_LABELS[roleKey] ?? 'Rol desconocido';

    return {
      email: current?.email ?? 'Usuario',
      role: roleLabel
    };
  });

  logout() {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Sesión cerrada');
          this.tokenService.clearTokens();
          this.router.navigate(['/']);
        },
        error: (err) => console.error('Error al cerrar sesión', err),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
