import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { NotFoundComponent } from '@layouts/not-found/not-found.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { loginGuard } from '@core/guards/login.guard';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { UserListComponent } from '@app/features/users/pages/user-management/user-management.component';
import { SportSpacesComponent } from '@app/features/sport-spaces/pages/sport-spaces-management/sport-spaces-management.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [loginGuard],
    component: LoginComponent,
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, roleGuard(['admin'])],
    component: UserListComponent
  },
  {
    path: 'espacios-deportivos',
    canActivate: [authGuard, roleGuard(['admin'])],
    component: SportSpacesComponent,
  },
  {
    path: 'reservas',
    canActivate: [authGuard, roleGuard(['student', 'trainer', 'admin'])],
    loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'reportes',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    canActivate: [authGuard],
    component: NotFoundComponent
  }
];
