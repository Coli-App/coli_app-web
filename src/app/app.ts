import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/header/header.component';
import { UserState } from './state/UserState';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private userState: UserState) {}

  readonly isLoggedIn = computed(() => !!this.userState.currentUser());
}
