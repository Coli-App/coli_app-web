import { Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserState {
  currentUser = signal<{name: string; email: string; role: string;} | null>(null);

  setUser(data: { name: string; email: string; role: string; }) {
    this.currentUser.set(data);
  }

  clearUser() {
    this.currentUser.set(null);
  }
}

