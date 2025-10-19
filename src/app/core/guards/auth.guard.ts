import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '@core/services/auth/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const isLoggedIn = !!tokenService.getAccessToken();

  if (!isLoggedIn) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
