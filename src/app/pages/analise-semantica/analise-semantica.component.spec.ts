import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaliseSemanticaComponent } from './analise-semantica.component';

describe('AnaliseSemanticaComponent', () => {
  let component: AnaliseSemanticaComponent;
  let fixture: ComponentFixture<AnaliseSemanticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnaliseSemanticaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaliseSemanticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
