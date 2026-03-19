import { NgModule } from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import { AuthRoutingModule } from './auth-routing-module';
import {LoginComponent} from './components/login/login.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, AuthRoutingModule,  MatIconModule, MatButton, ReactiveFormsModule, NgIf],
})
export class AuthModule {}
