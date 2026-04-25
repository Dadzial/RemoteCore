import { Component, OnDestroy, OnInit } from '@angular/core';
import { CameraData, WsCameraService } from '../../../services/ws-camera/ws-camera.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera',
  standalone: false,
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css',
})
export class CameraComponent implements OnInit, OnDestroy {
  public distances: number[] = [];
  private sub?: Subscription;

  constructor(private ws: WsCameraService) {}

  ngOnInit() {
    this.sub = this.ws.getLidarData$().subscribe((data: CameraData) => {
      this.distances = data.distances;
    });
  }

  getColor(distance: number): string {
    if (!distance || distance === 0) return '#0c0c0c';
    const maxDist = 2000;
    const hue = Math.min(240, (distance / maxDist) * 240);
    return `hsl(${hue}, 70%, 50%)`;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
