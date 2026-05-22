import { TestBed } from '@angular/core/testing';

import { WsDiagnostic } from './ws-diagnostic';

describe('WsDiagnostic', () => {
  let service: WsDiagnostic;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsDiagnostic);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
