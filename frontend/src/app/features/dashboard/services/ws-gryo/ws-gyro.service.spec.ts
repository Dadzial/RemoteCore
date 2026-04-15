import { TestBed } from '@angular/core/testing';

import { WsGyroService } from './ws-gyro.service';

describe('WsGyroService', () => {
  let service: WsGyroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsGyroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
