import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { NotFoundComponent } from '@layouts/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '**',
    component: NotFoundComponent 
  }
];
