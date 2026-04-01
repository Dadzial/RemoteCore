import {Component, ElementRef, HostListener, ViewChild, signal, computed} from '@angular/core';
import {WsSteeringService} from '../../../services/ws-steering/ws-steering.service';

export enum SteeringCommands {
  Fast = 'fast',
  Medium = 'medium',
  Slow = 'slow',
}

@Component({
  selector: 'app-steering',
  standalone: false,
  templateUrl: './sterring.component.html',
  styleUrl: './sterring.component.css',
})
export class SteeringComponent {
  @ViewChild('container') container!: ElementRef;

  protected readonly SteeringCommands = SteeringCommands;
  public joyStickPos = signal({x: 0, y: 0});

  public readonly thumbStyle = computed(() => ({
    transform: `translate(${this.joyStickPos().x}px, ${this.joyStickPos().y}px)`
  }));

  public readonly joystickValues = computed(() => {
    const { x, y } = this.joyStickPos();
    return {
      x: Math.round((x / this.maxRadius) * 100),
      y: Math.round(((y / this.maxRadius) * -1) * 100)
    };
  });

  constructor(private ws: WsSteeringService) {}

  public dragging = false;
  private maxRadius = 60;

  onStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
    this.onMove(event);
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;

    if (event instanceof TouchEvent) event.preventDefault();

    const rect = this.container.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.maxRadius) {
      deltaX *= this.maxRadius / distance;
      deltaY *= this.maxRadius / distance;
    }

    this.updatePosition(deltaX, deltaY);
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onEnd() {
    if (!this.dragging) return;
    this.dragging = false;
    this.updatePosition(0, 0);
    this.sendStop();
  }

  private updatePosition(x: number, y: number) {
    this.joyStickPos.set({ x, y });
    this.sendSteeringCommand(y / this.maxRadius * -1, x / this.maxRadius);
  }

  private sendSteeringCommand(y :number ,x :number): void {
    let left = y - x
    let right = y + x

    left = Math.max(-100, Math.min(100, left));
    right = Math.max(-100, Math.min(100, right));

    this.ws.sendSteeringCommand(left, right);
  }

  public onCommandClick(command: SteeringCommands) : void {
    let power: number;
    switch (command) {
      case SteeringCommands.Fast:
        power = 1;
        break;
      case SteeringCommands.Medium:
        power = 0.5;
        break;
      case SteeringCommands.Slow:
        power = 0.25;
        break;
      default:
        power = 0;
    }
    this.ws.sendSpeedCommand(power);
  }

  private sendStop(): void {
    this.ws.sendStop();
  }
}
