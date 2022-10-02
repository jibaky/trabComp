import { TestBed } from '@angular/core/testing';

import { AnalisadorLexicoService } from './analisador-lexico.service';

describe('AnalisadorLexicoService', () => {
  let service: AnalisadorLexicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalisadorLexicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
