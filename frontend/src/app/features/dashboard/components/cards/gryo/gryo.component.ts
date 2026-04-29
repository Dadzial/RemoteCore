import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GyroData, WsGyroService} from '../../../services/ws-gryo/ws-gyro.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-gryo',
  standalone: false,
  templateUrl: './gryo.component.html',
  styleUrl: './gryo.component.css',
})
export class GryoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('accelChart') accelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orientChart') orientCanvas!: ElementRef<HTMLCanvasElement>;

  public gyroData?: GyroData;
  private sub?: Subscription;
  private history: GyroData[] = [];
  private readonly MAX_HISTORY = 100;

  constructor(private ws: WsGyroService) {}

  ngOnInit() {
    this.sub = this.ws.getGyroData$().subscribe((data: GyroData | undefined) => {
      if (data) {
        this.gyroData = data;
        this.updateHistory(data);
        this.drawCharts();
      }
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  private initCharts() {
    [this.accelCanvas, this.orientCanvas].forEach(canvas => {
      if (canvas) {
        canvas.nativeElement.width = canvas.nativeElement.offsetWidth * window.devicePixelRatio;
        canvas.nativeElement.height = canvas.nativeElement.offsetHeight * window.devicePixelRatio;
      }
    });
  }

  private updateHistory(data: GyroData) {
    this.history.push(data);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
  }

  private drawCharts() {
    this.drawSingleChart(this.accelCanvas, ['ax', 'ay', 'az'], 20, ['#4ade80', '#fbbf24', '#f87171']);
    this.drawSingleChart(this.orientCanvas, ['pitch', 'roll', 'yaw'], 180, ['#60a5fa', '#a78bfa', '#f472b6']);
  }

  private drawSingleChart(canvasRef: ElementRef<HTMLCanvasElement>, keys: string[], range: number, colors: string[]) {
    if (!canvasRef) return;
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<=4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    keys.forEach((key, kidx) => {
      ctx.strokeStyle = colors[kidx];
      ctx.lineWidth = 2;
      ctx.beginPath();

      this.history.forEach((data: any, idx) => {
        const x = (canvas.width / (this.MAX_HISTORY - 1)) * idx;
        const val = data[key];
        const y = (canvas.height / 2) - (val / range) * (canvas.height / 2);

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  getBarWidth(value: number, max: number): number {
    const absVal = Math.abs(value);
    const percentage = (absVal / max) * 100;
    return Math.min(percentage, 100);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
