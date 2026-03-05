import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [
    MatIconModule,
    MatButton
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}
