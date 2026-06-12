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
/**
 * @class DiagnosticsComponent
 * @implements {OnInit, OnDestroy}
 * @brief Komponent diagnostyczny wykorzystujący wizualizację 3D (Three.js/Angular Three).
 *
 * Wyświetla model 3D robota, którego orientacja jest aktualizowana w czasie rzeczywistym
 * na podstawie danych z żyroskopu. Dodatkowo komponent wyświetla logi systemowe
 * i zmienia kolory części modelu 3D w zależności od stanu podzespołów (np. błąd IMU).
 */
export class DiagnosticsComponent implements OnInit, OnDestroy {
  public truckModel = gltfResource(() => '/assets/models/robot/robot_truck.glb');
  public boardModel = gltfResource(() => '/assets/models/robot/robot_board.glb');
  public esp32Model = gltfResource(() => '/assets/models/robot/robot_esp32.glb');
  public lidarModel = gltfResource(() => '/assets/models/robot/robot_lidar.glb');
  public imuModel = gltfResource(() => '/assets/models/robot/robot_imu.glb');
  public motorModel = gltfResource(() => '/assets/models/robot/robot_motor_h.glb');

  public robotRotation = signal<[number, number, number]>([0, 0, 0]);
  public logs = signal<LogEntry[]>([]);

  // Przechowuje aktualny kolor statusu dla poszczególnych komponentów
  private imuStatusColor = signal<string | null>(null);
  private lidarStatusColor = signal<string | null>(null);
  private espStatusColor = signal<string | null>(null);

  private initializedModels = new WeakSet<THREE.Object3D>();
  private sub: Subscription = new Subscription();

  /**
   * @brief Konstruktor komponentu diagnostyki.
   * Ustawia efekty monitorujące ładowanie modeli i zmiany statusów.
   */
  constructor(
    private wsDiagnostic: WsDiagnosticService,
    private wsGyro: WsGyroService
  ) {
    // Modele bez specjalnych kolorów statusu
    effect(() => {
      this.tryInit(this.truckModel.scene());
      this.tryInit(this.boardModel.scene());
      this.tryInit(this.motorModel.scene());
    });

    // Modele z kolorami statusu - konsolidacja tryInit + updateSceneColor
    effect(() => {
      const scene = this.imuModel.scene();
      const color = this.imuStatusColor();
      if (scene) {
        this.tryInit(scene);
        if (color) this.updateSceneColor(scene, color);
      }
    });

    effect(() => {
      const scene = this.lidarModel.scene();
      const color = this.lidarStatusColor();
      if (scene) {
        this.tryInit(scene);
        if (color) this.updateSceneColor(scene, color);
      }
    });

    effect(() => {
      const scene = this.esp32Model.scene();
      const color = this.espStatusColor();
      if (scene) {
        this.tryInit(scene);
        if (color) this.updateSceneColor(scene, color);
      }
    });
  }

  /**
   * @brief Inicjalizacja subskrypcji danych.
   */
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

        const msg = log.message;
        if (msg.includes('MPU6050') || msg.includes('IMU')) {
          this.imuStatusColor.set(log.level === 'error' ? '#ff0000' : '#00ff00');
        } else if (msg.includes('Lidar') || msg.includes('VL53L5CX')) {
          this.lidarStatusColor.set((log.level === 'warning' || log.level === 'error') ? '#ff0000' : '#00ff00');
        } else if (msg.includes('authorized') || msg.includes('WebSocket')) {
          this.espStatusColor.set('#00ff00');
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * @brief Bezpieczna inicjalizacja modelu (tylko raz).
   */
  private tryInit(scene: THREE.Group | THREE.Object3D | undefined | null) {
    if (!scene || this.initializedModels.has(scene)) return;
    this.initializedModels.add(scene);
    this.initModelMaterials(scene);
  }

  private updateSceneColor(scene: THREE.Group | THREE.Object3D | undefined | null, colorHex: string) {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.color.set(colorHex);
          mesh.material.emissive.set(colorHex);
          mesh.material.emissiveIntensity = 0.5;
        }
      }
    });
  }

  private initModelMaterials(scene: THREE.Group | THREE.Object3D) {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        let baseColor = '#c1c1c1';
        if (name.includes('wheel') || name.includes('board')) {
          baseColor = '#ffffff';
        }

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

  /**
   * @brief Obsługa zdarzenia utworzenia płótna Three.js.
   * @param state Stan renderera Angular Three.
   */
  onCanvasCreated(state: NgtState) {
    state.gl.setClearColor(0x000000, 0);
  }
}
