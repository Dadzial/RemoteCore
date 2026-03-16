import {Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {Router} from '@angular/router';
import {tap} from 'rxjs';

interface LoginResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  isLoggedIn = signal(false);
  username = signal<string | null>(null);

  private readonly api_url = environment.api.url + '/api/user';

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) {
      this.isLoggedIn.set(true);
    }
  }

  public login(username: string, password: string) {
    return this.http.post<LoginResponse>(this.api_url + '/auth', { login:username, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.isLoggedIn.set(true);
        this.username.set(res.username);
        this.router.navigate(['/dashboard/home']);
      })
    );
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}
