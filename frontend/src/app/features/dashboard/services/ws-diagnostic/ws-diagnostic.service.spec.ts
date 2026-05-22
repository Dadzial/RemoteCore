import { TestBed } from '@angular/core/testing';

import { WsDiagnosticService } from './ws-diagnostic.service';

describe('WsDiagnosticService', () => {
  let service: WsDiagnosticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsDiagnosticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
