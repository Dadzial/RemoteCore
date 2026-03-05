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
      const { username, password } = this.loginForm.value;

      this.auth.login(username, password).subscribe({
        error: err => {
          this.showError('Error in login or password');
        }
      });

    } else {
      this.showError('Enter Username and Password');
    }
  }

  private showError(message: string) {
    this.errorMessage.set(message);

    setTimeout(() => {
      this.errorMessage.set('');
    }, 2000);
  }
}
