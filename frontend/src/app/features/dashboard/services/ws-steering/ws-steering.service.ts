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

  public sendSpeedCommand(power : number): void {
    const payload = {
      data: {
        speed: Math.round(power * 200),
      }
    };
    this.ws.emit('speed:command', payload);
  }

  public sendStop(): void {
    this.ws.emit('steering:stop');
  }
}
