import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { NgxGaugeModule } from 'ngx-gauge';
import { DashboardRoutingModule } from './dashboard-routing-module';
import {SharedModule} from '../../shared/shared-module';
import {HomeComponent} from './components/home/home.component';
import {GryoComponent} from './components/cards/gryo/gryo.component';
import {SpeedComponent} from './components/cards/speed/speed.component';
import {DiagnosticsComponent} from './components/cards/diagnostics/diagnostics.component';
import {CameraComponent} from './components/cards/camera/camera.component';
import {SteeringComponent} from './components/cards/steering/sterring.component';
import {NgtCanvas, NgtCanvasContent, NgtCanvasImpl} from 'angular-three/dom';
import {NgtArgs} from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';


@NgModule({
  declarations: [HomeComponent,SteeringComponent,GryoComponent,SpeedComponent,DiagnosticsComponent,CameraComponent],
  imports: [CommonModule, DashboardRoutingModule, SharedModule, ...NgtCanvas, NgtCanvasImpl, NgtCanvasContent, NgtArgs, NgtsOrbitControls, NgOptimizedImage,NgxGaugeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule {}
