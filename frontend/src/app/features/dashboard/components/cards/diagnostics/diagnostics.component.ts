import { Component, ChangeDetectionStrategy } from '@angular/core';
import { extend, NgtArgs } from 'angular-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gltfResource } from 'angular-three-soba/loaders';


extend(THREE);
extend({ OrbitControls });


@Component({
  selector: 'app-diagnostics',
  standalone: false,
  templateUrl: './diagnostics.component.html',
  styleUrl: './diagnostics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticsComponent {
  public RobotModel = gltfResource(() => '/assets/models/robot/Robot.glb');
}
