import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '@core/services/auth/token.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const isLoggedIn = !!tokenService.getAccessToken();

  if (isLoggedIn) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
