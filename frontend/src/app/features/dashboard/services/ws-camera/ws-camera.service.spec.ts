import { TestBed } from '@angular/core/testing';

import { WsCameraService } from './ws-camera.service';

describe('WsCameraService', () => {
  let service: WsCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
