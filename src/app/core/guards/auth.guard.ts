import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '@core/services/auth/token.service';
import { UserState } from '@app/state/UserState';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const userState = inject(UserState);
  const router = inject(Router);

  const hasValidToken = tokenService.getAccessToken() && !tokenService.isTokenExpired();
  
  const hasUserData = userState.isAuthenticated();

  if (!hasValidToken || !hasUserData) {
    userState.clearUser();
    router.navigate(['/']);
    return false;
  }

  return true;
};
