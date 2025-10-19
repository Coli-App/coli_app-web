import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import player from 'lottie-web';
import { routes } from './app.routes';
import { provideLottieOptions } from 'ngx-lottie';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideLottieOptions({
      player: () => player,
    }),
    
    provideHttpClient(
      withInterceptors([authTokenInterceptor])
    ),
  ]
};
