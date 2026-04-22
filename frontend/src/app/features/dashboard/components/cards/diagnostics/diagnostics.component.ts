import { Component, ChangeDetectionStrategy, effect } from '@angular/core';
import { extend } from 'angular-three';
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

  constructor() {

    effect(() => {
      const scene = this.RobotModel.scene();
      if (scene) {
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: '#ffffff',
              metalness: 0.3,
              roughness: 0.7,
            });

            (mesh as any).pointerdown = (event: any) => {
              event.stopPropagation();
              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.color.set('#4ade80');
              }
            };
          }
        });
      }
    });
  }
}
