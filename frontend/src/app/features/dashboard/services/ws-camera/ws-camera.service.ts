import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CameraData {
  distances: number[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class WsCameraService {
  constructor(private ws: WebSocketService) {}

  getLidarData$(): Observable<CameraData> {
    return this.ws.on<any>('lidar:data').pipe(
      map((data: any) => ({
        distances: data.distances || [],
        timestamp: data.timestamp || Date.now(),
      }))
    );
  }
}
