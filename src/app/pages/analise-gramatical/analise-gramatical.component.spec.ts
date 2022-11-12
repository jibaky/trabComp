import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaliseGramaticalComponent } from './analise-gramatical.component';

describe('AnaliseGramaticalComponent', () => {
  let component: AnaliseGramaticalComponent;
  let fixture: ComponentFixture<AnaliseGramaticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnaliseGramaticalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaliseGramaticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
