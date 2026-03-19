import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

interface logoutResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  private readonly api_url = environment.api.url + '/api/user';

  constructor(private http: HttpClient) {}

  public logout(userId: string): Observable<any> {
    return this.http.delete<logoutResponse>(this.api_url + `/logout/${userId}`,{
      withCredentials:true,
    })
  }
}

