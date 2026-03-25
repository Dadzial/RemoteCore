import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LogoutService} from '../../../core/global-services/logout/logout.service';
import {AuthService} from '../../../core/global-services/auth/auth.service';
import {WebSocketService} from '../../../features/dashboard/services/web-socket/web-socket.service';
import {environment} from '../../../../environments/environment';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-tool-bar',
  imports: [],
  standalone:true,
  templateUrl: './tool-bar.html',
  styleUrl: './tool-bar.css',
})
export class ToolBar implements OnInit {
  constructor(private authService: AuthService,private ws: WebSocketService, private logoutService: LogoutService, private router: Router) {}
  private sub?: Subscription;
  displayName: string | null = null;

  ngOnInit(): void {
    this.ws.connect(environment.api.url);
    this.displayName = this.authService.getDisplayName();

    this.sub = this.ws.on('robot-status-confirmed').subscribe((data) => {
      console.log('Serwer :', data);
    });

    this.ws.emit('connection:robot-online', { firmwareVersion: '1.0.2' });
  }

  public onLogoutClick(): void {

    const userId = this.authService.getUserId();
    if (!userId) {
      this.clearAndRedirect();
      return
    }

    this.logoutService.logout(userId).subscribe({
      next: () => this.clearAndRedirect(),
      error: () => this.clearAndRedirect()
    });
  }

  private clearAndRedirect(): void {
    this.ws.close()
    localStorage.removeItem('token');
    this.router.navigate([''], {replaceUrl: true}).then(r => console.log('Redirected:', r));
  }
}
