import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CameraData, WsCameraService } from '../../../services/ws-camera/ws-camera.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera',
  standalone: false,
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css',
})
export class CameraComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('lidarCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  public distances: number[] = [];
  public stats = {
    avg: 0,
    min: 0,
    status: 'Clear'
  };
  private sub?: Subscription;
  private ctx: CanvasRenderingContext2D | null = null;
  private readonly RESOLUTION = 64;

  constructor(private ws: WsCameraService) {}

  ngOnInit() {
    this.sub = this.ws.getLidarData$().subscribe((data: CameraData) => {
      this.distances = data.distances;
      this.calculateStats();
      this.renderLidar();
    });
  }

  private calculateStats() {
    if (!this.distances.length) return;

    const validDistances = this.distances.filter(d => d > 0);
    if (!validDistances.length) return;

    this.stats.min = Math.min(...validDistances);
    this.stats.avg = Math.round(validDistances.reduce((a, b) => a + b, 0) / validDistances.length);

    if (this.stats.min < 300) {
      this.stats.status = 'CRITICAL';
    } else if (this.stats.min < 800) {
      this.stats.status = 'WARNING';
    } else {
      this.stats.status = '';
    }
    }
  ngAfterViewInit() {
    this.initCanvas();
  }

  private initCanvas() {
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = this.RESOLUTION;
      canvas.height = this.RESOLUTION;
      this.ctx = canvas.getContext('2d', { alpha: false });
    }
  }

  private renderLidar() {
    if (!this.ctx || !this.distances || this.distances.length !== 64) return;

    const imageData = this.ctx.createImageData(this.RESOLUTION, this.RESOLUTION);
    const data = imageData.data;

    for (let y = 0; y < this.RESOLUTION; y++) {
      for (let x = 0; x < this.RESOLUTION; x++) {

        const gx = (x / (this.RESOLUTION - 1)) * 7;
        const gy = (y / (this.RESOLUTION - 1)) * 7;

        const gxi = Math.floor(gx);
        const gyi = Math.floor(gy);

        const tx = gx - gxi;
        const ty = gy - gyi;

        const c00 = this.distances[gyi * 8 + gxi];
        const c10 = this.distances[gyi * 8 + (gxi + 1 > 7 ? 7 : gxi + 1)];
        const c01 = this.distances[(gyi + 1 > 7 ? 7 : gyi + 1) * 8 + gxi];
        const c11 = this.distances[(gyi + 1 > 7 ? 7 : gyi + 1) * 8 + (gxi + 1 > 7 ? 7 : gxi + 1)];

        const distance = this.lerp(this.lerp(c00, c10, tx), this.lerp(c01, c11, tx), ty);

        const [r, g, b] = this.getRGBColor(distance);
        const index = (y * this.RESOLUTION + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private getRGBColor(distance: number): [number, number, number] {
    if (!distance || distance === 0) return [12, 12, 12];

    const maxDist = 2000;
    const norm = Math.min(1, distance / maxDist);

    const hue = norm * 240;
    return this.hslToRgb(hue / 360, 0.8, 0.5);
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = this.hueToRgb(p, q, h + 1 / 3);
    g = this.hueToRgb(p, q, h);
    b = this.hueToRgb(p, q, h - 1 / 3);

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
