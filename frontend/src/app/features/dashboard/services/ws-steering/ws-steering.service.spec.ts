import { TestBed } from '@angular/core/testing';

import { WsSteeringService } from './ws-steering.service';

describe('WsSteeringService', () => {
  let service: WsSteeringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsSteeringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
