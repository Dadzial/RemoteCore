import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SterringComponent } from './sterring.component';

describe('SterringComponent', () => {
  let component: SterringComponent;
  let fixture: ComponentFixture<SterringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SterringComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SterringComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
