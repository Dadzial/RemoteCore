import { Component ,ChangeDetectionStrategy} from '@angular/core';
import { extend , NgtArgs } from 'angular-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loaderResource } from 'angular-three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
  public RobotModel = loaderResource(() => GLTFLoader, () => './assets/models/robot/robot.glb')

}
