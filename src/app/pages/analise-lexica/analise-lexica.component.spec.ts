import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaliseLexicaComponent } from './analise-lexica.component';

describe('AnaliseLexicaComponent', () => {
  let component: AnaliseLexicaComponent;
  let fixture: ComponentFixture<AnaliseLexicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnaliseLexicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaliseLexicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
