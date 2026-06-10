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

  private originalColors = new Map<string, string>();
  private sub: Subscription = new Subscription();

  /**
   * @brief Konstruktor komponentu diagnostyki.
   * Ustawia efekt (effect) monitorujący ładowanie modeli 3D w celu ich inicjalizacji.
   * @param wsDiagnostic Serwis logów diagnostycznych.
   * @param wsGyro Serwis danych z żyroskopu.
   */
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

  /**
   * @brief Inicjalizacja subskrypcji danych.
   * - Aktualizuje rotację modelu 3D na podstawie żyroskopu.
   * - Przetwarza logi diagnostyczne i wizualizuje statusy na modelu (kolory).
   */
  ngOnInit() {
    this.sub.add(
      this.wsGyro.getGyroData$().subscribe((data: GyroData) => {
        const r = THREE.MathUtils.degToRad(data.roll || 0);
        const p = THREE.MathUtils.degToRad(data.pitch || 0);
        const y = THREE.MathUtils.degToRad(data.yaw || 0);

        // Mapowanie osi IMU na osie Three.js
        this.robotRotation.set([p, y, r]);
      })
    );

    this.sub.add(
      this.wsDiagnostic.onLog().subscribe((log: LogEntry) => {
        this.logs.update(logs => [...logs, log].slice(-50));

        const msg = log.message;
        // Logika wizualnej sygnalizacji błędów na modelu 3D
        if (msg.includes('MPU6050') || msg.includes('IMU')) {
          const color = log.level === 'error' ? '#ff0000' : '#00ff00';
          this.updateSceneColor(this.imuModel.scene(), color);
        } else if (msg.includes('Lidar') || msg.includes('VL53L5CX')) {
          const color = (log.level === 'warning' || log.level === 'error') ? '#ff0000' : '#00ff00';
          this.updateSceneColor(this.lidarModel.scene(), color);
        } else if (msg.includes('authorized') || msg.includes('WebSocket')) {
          this.updateSceneColor(this.esp32Model.scene(), '#00ff00');
        }
      })
    );
  }

  /**
   * @brief Sprzątanie subskrypcji.
   */
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * @brief Zmienia kolor i emisyjność materiałów w danej scenie (podmodelu) 3D.
   * @param scene Obiekt 3D (Group/Object3D).
   * @param colorHex Kolor w formacie hex.
   */
  private updateSceneColor(scene: THREE.Group | THREE.Object3D | undefined | null, colorHex: string) {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.color.set(colorHex);
          mesh.material.emissive.set(colorHex);
          mesh.material.emissiveIntensity = 0.3;
        }
      }
    });
  }

  /**
   * @brief Inicjalizuje materiały modelu po załadowaniu pliku GLB.
   * Ustawia bazowe kolory, metaliczność i chropowatość materiałów.
   * @param scene Załadowana scena 3D.
   */
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

  /**
   * @brief Obsługa zdarzenia utworzenia płótna Three.js.
   * @param state Stan renderera Angular Three.
   */
  onCanvasCreated(state: NgtState) {
    state.gl.setClearColor(0x000000, 0);
  }
}
