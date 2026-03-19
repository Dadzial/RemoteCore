import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LogoutService} from '../../../core/global-services/logout/logout.service';
import {AuthService} from '../../../core/global-services/auth/auth.service';

@Component({
  selector: 'app-tool-bar',
  imports: [],
  standalone:true,
  templateUrl: './tool-bar.html',
  styleUrl: './tool-bar.css',
})
export class ToolBar implements OnInit {
  constructor(private authService: AuthService, private logoutService: LogoutService, private router: Router) {
  }

  displayName: string | null = null;

  ngOnInit(): void {
    this.displayName = this.authService.getDisplayName();
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
    localStorage.removeItem('token');
    this.router.navigate([''], {replaceUrl: true}).then(r => console.log('Redirected:', r));
  }
}
