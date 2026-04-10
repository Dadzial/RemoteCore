import { Component ,ChangeDetectionStrategy} from '@angular/core';
import { extend } from 'angular-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  protected readonly Math = Math;

}
