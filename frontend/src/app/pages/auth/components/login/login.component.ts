import {Component, signal} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginService} from '../../services/login/login.service';
import {NgIf} from '@angular/common';
import {AfterViewInit} from '@angular/core';
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
export class LoginComponent implements AfterViewInit{
  loginForm: FormGroup;
  errorMessage = signal('');

  constructor(private fb: FormBuilder, private auth: LoginService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    const inputs = document.querySelectorAll('input');

    inputs.forEach((input: any) => {
      input.addEventListener('focus', () => {
        setTimeout(() => {
          input.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      });
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

  private showError(message: string) {
    this.errorMessage.set(message);

    setTimeout(() => {
      this.errorMessage.set('');
    }, 2000);
  }
}
