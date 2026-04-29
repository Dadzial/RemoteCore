import {Component, OnDestroy, OnInit} from '@angular/core';
import {GyroData, WsGyroService} from '../../../services/ws-gryo/ws-gyro.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-gryo',
  standalone: false,
  templateUrl: './gryo.component.html',
  styleUrl: './gryo.component.css',
})
export class GryoComponent implements OnInit , OnDestroy {
  public gyroData?: GyroData;
  private sub?: Subscription;

  constructor(private ws:WsGyroService) {}

  ngOnInit() {
    this.sub = this.ws.getGyroData$().subscribe((data: GyroData | undefined) => {
      this.gyroData = data;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  getBarWidth(value: number, max: number): number {
    const absVal = Math.abs(value);
    const percentage = (absVal / max) * 100;
    return Math.min(percentage, 100);
  }
}
