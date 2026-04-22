import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GyroData {
  roll: number;
  pitch: number;
  yaw: number;
  ax: number;
  ay: number;
  az: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class WsGyroService {

  constructor(private ws: WebSocketService) {}

  getGyroData$(): Observable<GyroData> {
    return this.ws.on<any>('gyro:data').pipe(
      map((data: any) => ({
        roll: data.roll,
        pitch: data.pitch,
        yaw: data.yaw,
        ax: data.ax,
        ay: data.ay,
        az: data.az,
        timestamp: data.timestamp,
      }))
    );
  }
}
