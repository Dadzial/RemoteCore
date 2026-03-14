import {Component, signal} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginService} from '../../services/login/login.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatButton,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal('');

  constructor(private fb: FormBuilder, private auth: LoginService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  public submit() {
    if (this.loginForm.valid) {
      const {username, password} = this.loginForm.value;

      this.auth.login(username, password).subscribe({
        next: () => {

        },
        error: err => {
          if (err.status === 401) {
            this.showError('Invalid username or password');
          } else if (err.status === 429) {
            this.showError('Too many login attempts. Please wait.');
          } else if (err.status === 0) {
            this.showError('Check your connection to server.');
          } else {
            this.showError('Something went wrong. Try again later.');
          }
        }
      });

    } else {
      if (!this.loginForm.get('username')?.value) {
        this.showError('Username is required');
      } else if (!this.loginForm.get('password')?.value) {
        this.showError('Password is required');
      }
    }
  }

  public focusUsername(): void {
    const el = document.querySelector('.username-input') as HTMLElement;

    const scrollWhenReady = () => {
      const rect = el?.getBoundingClientRect();
      if (rect && rect.bottom > window.visualViewport!.height) {
        window.scrollBy({
          top: rect.bottom - window.visualViewport!.height + 20,
          behavior: 'smooth'
        });
      }
    };

    window.visualViewport?.addEventListener('resize', scrollWhenReady, { once: true });
  }


  public focusPassword(): void {
    const el = document.querySelector('.password-input') as HTMLElement;

    const scrollWhenReady = () => {
      const rect = el?.getBoundingClientRect();
      if (rect && rect.bottom > window.visualViewport!.height) {
        window.scrollBy({
          top: rect.bottom - window.visualViewport!.height + 20,
          behavior: 'smooth'
        });
      }
    };

    window.visualViewport?.addEventListener('resize', scrollWhenReady, { once: true });
  }

  private showError(message: string) {
    this.errorMessage.set(message);

    setTimeout(() => {
      this.errorMessage.set('');
    }, 2000);
  }
}
