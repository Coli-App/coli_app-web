import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserState } from '@app/state/UserState';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const userState = inject(UserState);
    const router = inject(Router);

    const userRole = userState.userRole();

    if (!userRole) {
      router.navigate(['/']);
      return false;
    }

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
