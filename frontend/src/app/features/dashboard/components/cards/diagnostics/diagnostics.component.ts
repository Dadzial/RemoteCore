import { Component, ChangeDetectionStrategy, effect } from '@angular/core';
import { extend, NgtState } from 'angular-three';
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
  public truckModel = gltfResource(() => '/assets/models/robot/robot_truck.glb');
  public boardModel = gltfResource(() => '/assets/models/robot/robot_board.glb');
  public esp32Model = gltfResource(() => '/assets/models/robot/robot_esp32.glb');
  public lidarModel = gltfResource(() => '/assets/models/robot/robot_lidar.glb');
  public imuModel = gltfResource(() => '/assets/models/robot/robot_imu.glb');
  public motorModel = gltfResource(() => '/assets/models/robot/robot_motor_h.glb');

  private originalColors = new Map<string, string>();

  constructor() {
    effect(() => {
      this.initModel(this.truckModel.scene());
      this.initModel(this.boardModel.scene());
      this.initModel(this.esp32Model.scene());
      this.initModel(this.lidarModel.scene());
      this.initModel(this.imuModel.scene());
      this.initModel(this.motorModel.scene());
    });
  }

  private initModel(scene: THREE.Group | THREE.Object3D | undefined | null) {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        let baseColor = '#c1c1c1';
        if (
          name.includes('wheel') ||
          name.includes('board')
        ) {
          baseColor = '#ffffff';
        }

        this.originalColors.set(mesh.uuid, baseColor);

        mesh.material = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.8,
          roughness: 0.2,
          emissive: new THREE.Color(0x000000),
          emissiveIntensity: 1,
        });
      }
    });
  }

  onCanvasCreated(state: NgtState) {
    state.gl.setClearColor(0x000000, 0);
  }
}
