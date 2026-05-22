import { Component, ChangeDetectionStrategy, effect, OnInit, OnDestroy } from '@angular/core';
import { extend, NgtState } from 'angular-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gltfResource } from 'angular-three-soba/loaders';
import { WsDiagnosticService, LogEntry } from '../../../services/ws-diagnostic/ws-diagnostic.service';
import { WsGyroService, GyroData } from '../../../services/ws-gryo/ws-gyro.service';
import { Subscription } from 'rxjs';
import { signal } from '@angular/core';

extend(THREE);
extend({ OrbitControls });

@Component({
  selector: 'app-diagnostics',
  standalone: false,
  templateUrl: './diagnostics.component.html',
  styleUrl: './diagnostics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  public truckModel = gltfResource(() => '/assets/models/robot/robot_truck.glb');
  public boardModel = gltfResource(() => '/assets/models/robot/robot_board.glb');
  public esp32Model = gltfResource(() => '/assets/models/robot/robot_esp32.glb');
  public lidarModel = gltfResource(() => '/assets/models/robot/robot_lidar.glb');
  public imuModel = gltfResource(() => '/assets/models/robot/robot_imu.glb');
  public motorModel = gltfResource(() => '/assets/models/robot/robot_motor_h.glb');

  public robotRotation = signal<[number, number, number]>([0, 0, 0]);
  public logs = signal<LogEntry[]>([]);

  private originalColors = new Map<string, string>();
  private sub: Subscription = new Subscription();

  constructor(
    private wsDiagnostic: WsDiagnosticService,
    private wsGyro: WsGyroService
  ) {
    effect(() => {
      this.initModel(this.truckModel.scene());
      this.initModel(this.boardModel.scene());
      this.initModel(this.esp32Model.scene());
      this.initModel(this.lidarModel.scene());
      this.initModel(this.imuModel.scene());
      this.initModel(this.motorModel.scene());
    });
  }

  ngOnInit() {
    this.sub.add(
      this.wsGyro.getGyroData$().subscribe((data: GyroData) => {
        const r = THREE.MathUtils.degToRad(data.roll || 0);
        const p = THREE.MathUtils.degToRad(data.pitch || 0);
        const y = THREE.MathUtils.degToRad(data.yaw || 0);

        this.robotRotation.set([p, y, r]);
      })
    );

    this.sub.add(
      this.wsDiagnostic.onLog().subscribe((log: LogEntry) => {
        this.logs.update(logs => [...logs, log].slice(-50));
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
