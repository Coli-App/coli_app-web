import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { TokenService } from '@app/core/services/auth/token.service';

export interface User {
  name: string;
  email: string;
  role: string;
}
const USER_DATA_KEY = 'user_data';

@Injectable({ providedIn: 'root' })
export class UserState {
  private tokenService = inject(TokenService);

  private readonly _currentUser = signal<User | null>(null);

  public readonly currentUser = this._currentUser.asReadonly();

  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly userRole = computed(() => this.currentUser()?.role ?? null);
  public readonly userEmail = computed(() => this.currentUser()?.email ?? null);

  constructor() {
    this.loadUserFromToken();
    effect(() => {
      const token = this.tokenService.getAccessToken();
      if (token && !this.currentUser()) {
        this.loadUserFromToken();
      } else if (!token && this.currentUser()) {
        this.clearUser();
      }
    });
  }

  private setUser(user: User) {
    this._currentUser.set(user);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    console.log('User data saved:', user);
  }

  clearUser() {
    this._currentUser.set(null);
    localStorage.removeItem(USER_DATA_KEY);
  }

 private loadUserFromToken() {
    try {
      const token = this.tokenService.getAccessToken();
      const isExpired = this.tokenService.isTokenExpired();

      if (!token || isExpired) {
        this.clearUser();
        return;
      }

      const userData = localStorage.getItem(USER_DATA_KEY);
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          this._currentUser.set(parsedData);
          return;
        } catch (e) {
          console.warn('Invalid userData in localStorage, removing...');
          localStorage.removeItem(USER_DATA_KEY);
        }
      }

      const decodedToken = this.tokenService.decodeToken();

      if (decodedToken?.email) {
        const user: User = {
          name: decodedToken.name || decodedToken.sub || 'Usuario',
          email: decodedToken.email,
          role: decodedToken.role || 'user',
        };
        this.setUser(user);
        console.log('User loaded from token (fallback)');
      } else {
        console.log('No valid user data in token');
        this.clearUser();
      }
    } catch (error) {
      console.error('Error loading user from token:', error);
      this.clearUser();
    }
  }
}
