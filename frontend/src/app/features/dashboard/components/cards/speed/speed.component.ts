import { Component, computed, inject, signal, OnInit, HostListener } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {WsSteeringService} from '../../../services/ws-steering/ws-steering.service';
import {WsDiagnosticService} from '../../../services/ws-diagnostic/ws-diagnostic';
import {WsGyroService} from '../../../services/ws-gryo/ws-gyro.service';
import {WsCameraService} from '../../../services/ws-camera/ws-camera.service';

type NgxGaugeType = 'full' | 'arch' | 'semi';
type NgxGaugeCap = 'round' | 'butt';

@Component({
  selector: 'app-speed',
  standalone: false,
  templateUrl: './speed.component.html',
  styleUrl: './speed.component.css',
})
/**
 * @class SpeedComponent
 * @implements {OnInit}
 * @brief Komponent wyświetlający wskaźniki prędkości, jakości połączenia oraz wibracji.
 *
 * Wykorzystuje bibliotekę ngx-gauge do wizualizacji parametrów robota.
 * Oblicza częstotliwość odświeżania danych (Hz) dla IMU i Lidara oraz czas pracy urządzenia (uptime).
 */
export class SpeedComponent implements OnInit {
  private steeringWs = inject(WsSteeringService);
  private diagnosticWs = inject(WsDiagnosticService);
  private gyroWs = inject(WsGyroService);
  private cameraWs = inject(WsCameraService);

  private status = toSignal(this.diagnosticWs.onStatus());

  public imuHz = signal(0);
  public lidarHz = signal(0);
  private lastImuT = 0;
  private lastLidarT = 0;

  public mainGaugeSize = signal(190);
  public sideGaugeSize = signal(125);
  public mainGaugeThick = signal(12);
  public sideGaugeThick = signal(8);

  public vibration = signal(0);
  private lastAccel = { ax: 0, ay: 0, az: 0 };

  /**
   * @brief Konstruktor komponentu prędkościomierza.
   * Inicjalizuje subskrypcje w celu obliczania Hz oraz poziomu wibracji na podstawie zmian przyspieszenia.
   */
  constructor() {
    this.updateGaugeSizes();
    this.gyroWs.getGyroData$().subscribe(data => {
      if (!data) return;
      const now = Date.now();

      // Obliczanie częstotliwości IMU (Hz)
      if (this.lastImuT) {
        const dt = (now - this.lastImuT) / 1000;
        if (dt > 0) this.imuHz.set(Math.round(1 / dt));
      }
      this.lastImuT = now;

      // Obliczanie poziomu wibracji jako różnicy wektorowej przyspieszeń
      const dv = Math.sqrt(
        Math.pow(data.ax - this.lastAccel.ax, 2) +
        Math.pow(data.ay - this.lastAccel.ay, 2) +
        Math.pow(data.az - this.lastAccel.az, 2)
      );
      this.vibration.set(Math.min(4, dv / 9.8));
      this.lastAccel = { ax: data.ax, ay: data.ay, az: data.az };
    });

    this.cameraWs.getLidarData$().subscribe(() => {
      const now = Date.now();
      // Obliczanie częstotliwości Lidara (Hz)
      if (this.lastLidarT) {
        const dt = (now - this.lastLidarT) / 1000;
        if (dt > 0) this.lidarHz.set(Math.round(1 / dt));
      }
      this.lastLidarT = now;
    });
  }

  /**
   * @brief Inicjalizacja komponentu.
   */
  ngOnInit() {
    this.updateGaugeSizes();
  }

  /**
   * @brief Obsługa zmiany rozmiaru okna w celu dopasowania wielkości zegarów.
   */
  @HostListener('window:resize')
  onResize() {
    this.updateGaugeSizes();
  }

  /**
   * @brief Dostosowuje rozmiary i grubość zegarów (gauges) do aktualnej szerokości ekranu.
   */
  private updateGaugeSizes() {
    const width = window.innerWidth;

    if (width <= 600) {
      this.mainGaugeSize.set(120);
      this.sideGaugeSize.set(80);
      this.mainGaugeThick.set(8);
      this.sideGaugeThick.set(6);
    } else if (width < 1090) {
      this.mainGaugeSize.set(150);
      this.sideGaugeSize.set(100);
      this.mainGaugeThick.set(10);
      this.sideGaugeThick.set(7);
    } else if (width <= 1560) {
      this.mainGaugeSize.set(140);
      this.sideGaugeSize.set(90);
      this.mainGaugeThick.set(9);
      this.sideGaugeThick.set(6);
    } else {
      this.mainGaugeSize.set(190);
      this.sideGaugeSize.set(125);
      this.mainGaugeThick.set(12);
      this.sideGaugeThick.set(8);
    }
  }

  /**
   * @brief Obliczona aktualna prędkość pobierana z serwisu sterowania.
   */
  speedValue = computed(() => this.steeringWs.currentSpeed());

  /**
   * @brief Mapuje wartość RSSI na procentową jakość połączenia (Link Quality).
   */
  linkQuality = computed(() => {
    const rssi = this.status()?.rssi ?? -100;
    return Math.max(0, Math.min(100, 2 * (rssi + 100)));
  });

  /**
   * @brief Formatuje czas pracy urządzenia (ms) do postaci HH:MM:SS.
   */
  runtimeValue = computed(() => {
    const uptime = this.status()?.uptime ?? 0;
    const h = Math.floor(uptime / 3600000);
    const m = Math.floor((uptime % 3600000) / 60000);
    const s = Math.floor((uptime % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  centerGaugeType: NgxGaugeType = 'arch';
  gaugeCap: NgxGaugeCap = 'round';
  gaugeTrackColor = 'rgba(0, 0, 0, 0.4)';

  signalThresholds = {
    0: { color: '#ff4d4d' },
    40: { color: '#ffcc00' },
    70: { color: '#00e676' }
  };

  speedThresholds = {
    0: { color: '#00e676' },
    1.8: { color: '#ffcc00' },
    2.5: { color: '#ff4d4d' }
  };

  vibThresholds = {
    0: { color: '#00e676' },
    0.5: { color: '#ffcc00' },
    1.2: { color: '#ff4d4d' }
  };
}


