import { TestBed } from '@angular/core/testing';

import { AnalisadorGramaticalService } from './analisador-gramatical.service';

describe('AnalisadorGramaticalService', () => {
  let service: AnalisadorGramaticalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalisadorGramaticalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
