import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GryoComponent } from './gryo.component';

describe('GryoComponent', () => {
  let component: GryoComponent;
  let fixture: ComponentFixture<GryoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GryoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GryoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
