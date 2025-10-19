import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { NotFoundComponent } from '@layouts/not-found/not-found.component';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { loginGuard } from '@core/guards/login.guard';
import { authGuard } from '@core/guards/auth.guard';

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
    path: '**',
    component: NotFoundComponent
  }
];
