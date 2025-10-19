import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { TokenService } from '@app/core/services/auth/token.service';
import { UserState } from '@app/state/UserState';
import { finalize, Observable, tap } from 'rxjs';
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
    private userState: UserState,
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

          this.userState.setUser({
            name: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role,
          });
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.getUrl()}/logout`, {}).pipe(
      finalize(() => {
        this.tokenService.clearTokens();
        this.userState.clearUser();
        this.router.navigate(['/']);
      })
    );
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}
