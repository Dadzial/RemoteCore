import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable, Subject } from 'rxjs';

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
  private gyroDataSubject = new Subject<GyroData>();

  constructor(private ws: WebSocketService) {
    this.ws.on<any>('gyro:data').subscribe((data: any) => {
      let payload = Array.isArray(data) && data.length > 1 ? data[1] : (data.data || data);
      if (Array.isArray(data) && data.length > 1) {
        payload = data[1];
      }
      this.gyroDataSubject.next({
        roll: payload.roll,
        pitch: payload.pitch,
        yaw: payload.yaw,
        ax: payload.ax,
        ay: payload.ay,
        az: payload.az,
        timestamp: payload.timestamp,
      });
    });
  }

  getGyroData$(): Observable<GyroData> {
    return this.gyroDataSubject.asObservable();
  }
}
