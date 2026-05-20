import { Component, computed, inject, signal } from '@angular/core';
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
export class SpeedComponent {
  private steeringWs = inject(WsSteeringService);
  private diagnosticWs = inject(WsDiagnosticService);
  private gyroWs = inject(WsGyroService);
  private cameraWs = inject(WsCameraService);

  private status = toSignal(this.diagnosticWs.onStatus());

  public imuHz = signal(0);
  public lidarHz = signal(0);
  private lastImuT = 0;
  private lastLidarT = 0;


  public vibration = signal(0);
  private lastAccel = { ax: 0, ay: 0, az: 0 };

  constructor() {
    this.gyroWs.getGyroData$().subscribe(data => {
      if (!data) return;
      const now = Date.now();
      if (this.lastImuT) {
        const dt = (now - this.lastImuT) / 1000;
        if (dt > 0) this.imuHz.set(Math.round(1 / dt));
      }
      this.lastImuT = now;

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
      if (this.lastLidarT) {
        const dt = (now - this.lastLidarT) / 1000;
        if (dt > 0) this.lidarHz.set(Math.round(1 / dt));
      }
      this.lastLidarT = now;
    });
  }

  speedValue = computed(() => this.steeringWs.currentSpeed());

  linkQuality = computed(() => {
    const rssi = this.status()?.rssi ?? -100;
    return Math.max(0, Math.min(100, 2 * (rssi + 100)));
  });

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


