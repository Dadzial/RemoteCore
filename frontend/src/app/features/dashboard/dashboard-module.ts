import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing-module';
import {SharedModule} from '../../shared/shared-module';
import {HomeComponent} from './components/home/home.component';
import {GryoComponent} from './components/cards/gryo/gryo.component';
import {SpeedComponent} from './components/cards/speed/speed.component';
import {DiagnosticsComponent} from './components/cards/diagnostics/diagnostics.component';
import {CameraComponent} from './components/cards/camera/camera.component';
import {SteeringComponent} from './components/cards/steering/sterring.component';

@NgModule({
  declarations: [HomeComponent,SteeringComponent,GryoComponent,SpeedComponent,DiagnosticsComponent,CameraComponent],
  imports: [CommonModule, DashboardRoutingModule,SharedModule],
})
export class DashboardModule {}
