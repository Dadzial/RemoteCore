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

/**
 * @class WsGyroService
 * @brief Serwis obsługujący odbieranie danych z modułu IMU (żyroskop i akcelerometr).
 */
@Injectable({
  providedIn: 'root',
})
export class WsGyroService {

  /**
   * @brief Konstruktor serwisu IMU.
   * @param ws Serwis WebSocket.
   */
  constructor(private ws: WebSocketService) {}

  /**
   * @brief Zwraca strumień danych o orientacji i przyspieszeniu robota.
   * Mapuje surowe dane na ustrukturyzowany format GyroData.
   * @return Observable z danymi IMU.
   */
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
