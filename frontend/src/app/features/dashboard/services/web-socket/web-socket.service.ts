import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket?: Socket;

  constructor(private ngZone: NgZone) {}

  public connect(url: string): void {
    if (!this.socket) {
      console.log('[WS] Connecting to:', url);
      this.socket = io(url, {
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => {
        this.ngZone.run(() => {
          console.log('[WS] Connected:', this.socket?.id);
        });
      });

      this.socket.on('connect_error', (err) => {
        this.ngZone.run(() => {
          console.error('[WS] Connection error:', err);
        });
      });

      this.socket.on('disconnect', (reason) => {
        this.ngZone.run(() => {
          console.warn('[WS] Disconnected:', reason);
        });
      });
    }
  }

  public on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      const checkAndSubscribe = () => {
        if (this.socket) {
          this.socket.on(event, (data: T) => {
            this.ngZone.run(() => {
              observer.next(data);
            });
          });
        } else {
          setTimeout(checkAndSubscribe, 100);
        }
      };

      checkAndSubscribe();
      return () => this.socket?.off(event);
    });
  }

  public emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[WS] Cannot emit '${event}', socket not connected`);
    }
  }

  public close(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
