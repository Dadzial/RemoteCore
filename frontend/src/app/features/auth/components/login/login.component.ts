import {Component, signal} from '@angular/core';
import {FormBuilder, FormGroup ,Validators} from '@angular/forms';
import {LoginService} from '../../services/login/login.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent{
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

  private showError(message: string) {
    this.errorMessage.set(message);

    setTimeout(() => {
      this.errorMessage.set('');
    }, 2000);
  }
}
