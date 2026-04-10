import { Injectable } from '@angular/core';
import {WebSocketService} from '../web-socket/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class WsSteeringService {

  constructor(private ws: WebSocketService) {}

  public sendSteeringCommand(left: number, right: number): void {
    const payload = {
      data: {
        leftMotor: Math.round(left),
        rightMotor: Math.round(right)
      }
    };
    this.ws.emit('steering:command', payload);
  }

  public sendStop(): void {
    this.ws.emit('steering:stop');
  }
}
