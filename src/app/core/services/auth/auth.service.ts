import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { TokenService } from '@app/core/services/auth/token.service';
import { finalize, Observable, tap, catchError, of } from 'rxjs';
import { AuthResponse } from '@app/core/models/auth-response.model';
import { LoginRequest } from '@app/core/models/requests/login-request';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.apiUrl;
  model = 'auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.getUrl()}/login`, request).pipe(
      tap((response) => {
        if (response.success) {
          this.tokenService.saveTokens(
            response.data.session.access_token,
            response.data.session.refresh_token
          );

          const decodedToken = this.tokenService.decodeToken();
          if (decodedToken) {
            const userData = {
              id: decodedToken.app_metadata?.user_id || '',
              name: decodedToken.email?.split('@')[0] || '',
              email: decodedToken.email || '',
              role: decodedToken.app_metadata?.user_role || 'user'
            };
            localStorage.setItem('user_data', JSON.stringify(userData));
            console.log('User data with correct ID:', userData);
          }

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.getUrl()}/logout`, {});
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}
