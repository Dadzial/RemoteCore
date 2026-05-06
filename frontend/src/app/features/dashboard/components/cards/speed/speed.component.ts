import { Component } from '@angular/core';

type NgxGaugeType = 'full' | 'arch' | 'semi';
type NgxGaugeCap = 'round' | 'butt';

@Component({
  selector: 'app-speed',
  standalone: false,
  templateUrl: './speed.component.html',
  styleUrl: './speed.component.css',
})
export class SpeedComponent {
  batteryValue = 85;
  speedValue = 1.2;
  loadValue = 10.5;

  voltage = 12.4;
  temp = 32.5;
  runtime = '01:24:15';

  leftGaugeType: NgxGaugeType = 'semi';
  centerGaugeType: NgxGaugeType = 'arch';
  rightGaugeType: NgxGaugeType = 'semi';
  gaugeCap: NgxGaugeCap = 'round';
  gaugeTrackColor = 'rgba(0, 0, 0, 0.4)';


  batteryThresholds = {
    0: { color: '#ff4d4d' },
    20: { color: '#ffcc00' },
    50: { color: '#00e676' }
  };

  speedThresholds = {
    0: { color: '#00e676' },
    1.8: { color: '#ffcc00' },
    2.5: { color: '#ff4d4d' }
  };

  loadThresholds = {
    0: { color: '#00e676' },
    7: { color: '#ffcc00' },
    10: { color: '#ff4d4d' }
  };
}


