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
        roll: data.r !== undefined ? data.r : data.roll,
        pitch: data.p !== undefined ? data.p : data.pitch,
        yaw: data.y !== undefined ? data.y : data.yaw,
        ax: data.ax || 0,
        ay: data.ay || 0,
        az: data.az || 0,
        timestamp: data.t || data.timestamp || Date.now(),
      }))
    );
  }
}
