import { Injectable, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private jwtHelper = new JwtHelperService();

  private readonly _accessToken = signal<string | null>(null);
  public readonly accessToken = this._accessToken.asReadonly();

  constructor() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    this._accessToken.set(token);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    this._accessToken.set(accessToken);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  decodeToken(): any {
    const token = this.getAccessToken();
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._accessToken.set(null);
  }
}
