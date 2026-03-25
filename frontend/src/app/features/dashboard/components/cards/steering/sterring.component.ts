import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-steering',
  standalone: false,
  templateUrl: './sterring.component.html',
  styleUrl: './sterring.component.css',
})
export class SteeringComponent {
  @ViewChild('container') container!: ElementRef;

  thumbStyle = { transform: 'translate(0px, 0px)' };

  private dragging = false;
  private maxRadius = 60;

  onStart(event: MouseEvent | TouchEvent) {
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
  }

  private updatePosition(x: number, y: number) {
    this.thumbStyle = {
      transform: `translate(${x}px, ${y}px)`
    };

    const percentX = x / this.maxRadius;
    const percentY = (y / this.maxRadius) * -1;

  }
}
