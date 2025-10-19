import { ChangeDetectionStrategy, Component, signal, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '@app/core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  loginError = signal<string | null>(null);


  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {

  }

  onSubmit() {
    if (this.form.valid) {
      this.loginError.set(null);

      this.authService.login(this.form.value).subscribe({
        next: (response) => {
          console.log('Login successful', response.message);
        },
        error: (error) => {
          console.error('Login failed', error);
          if (error.status === 401 || error.status === 403) {
            this.loginError.set('Credenciales inválidas.')
          } else {
            this.loginError.set('Error al iniciar sesión.');
          }
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
