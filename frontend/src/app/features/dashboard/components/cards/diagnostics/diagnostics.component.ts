import {Component, ChangeDetectionStrategy, effect, signal, OnInit} from '@angular/core';
import { extend, NgtState } from 'angular-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gltfResource } from 'angular-three-soba/loaders';
import {WebSocketService} from '../../../services/web-socket/web-socket.service';
import {WsDiagnosticService} from '../../../services/ws-diagnostic/ws-diagnostic';

extend(THREE);
extend({ OrbitControls });

interface LogEntry {
  timestamp: string;
  message: string;
  type : 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-diagnostics',
  standalone: false,
  templateUrl: './diagnostics.component.html',
  styleUrl: './diagnostics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticsComponent implements OnInit {

  public info = signal<LogEntry[]>([]);

  public truckModel = gltfResource(() => '/assets/models/robot/robot_truck.glb');
  public boardModel = gltfResource(() => '/assets/models/robot/robot_board.glb');
  public esp32Model = gltfResource(() => '/assets/models/robot/robot_esp32.glb');
  public lidarModel = gltfResource(() => '/assets/models/robot/robot_lidar.glb');
  public imuModel = gltfResource(() => '/assets/models/robot/robot_imu.glb');
  public motorModel = gltfResource(() => '/assets/models/robot/robot_motor_h.glb');

  private originalColors = new Map<string, string>();

  constructor(
    private wsDiagnostic: WsDiagnosticService,
    private webSocketService: WebSocketService
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
    this.addLog('System Diagnostic Initialized', 'info');

    this.wsDiagnostic.onLog().subscribe(log => {
      this.addLog(log.msg, log.type);
    });

    // Nasłuchiwanie na status sprzętowy (Heap, RSSI)
    this.wsDiagnostic.onStatus().subscribe(status => {
      this.addLog(`Status: RSSI: ${status.rssi}dBm, Free Heap: ${Math.round(status.heap/1024)}KB`, 'info');
    });

    this.webSocketService.on('connection:robot-online').subscribe((data: any) => {
      this.addLog(`Robot Online - Firmware: ${data.v || 'unknown'}`, 'success');
    });
  }

  private addLog(message: string, type: LogEntry['type']) {
    const timestamp = new Date().toLocaleTimeString();
    this.info.update(logs => [{timestamp, message, type}, ...logs].slice(0, 50));
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
