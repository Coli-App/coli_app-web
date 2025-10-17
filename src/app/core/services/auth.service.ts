import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = environment.apiUrl;
  model = "Authentication";

  constructor() { }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}
