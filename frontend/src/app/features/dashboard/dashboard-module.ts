import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing-module';
import {SharedModule} from '../../shared/shared-module';
import {HomeComponent} from './components/home/home.component';
import {SterringComponent} from './components/cards/sterring/sterring.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, DashboardRoutingModule,SharedModule, SterringComponent],
})
export class DashboardModule {}
