import { TestBed } from '@angular/core/testing';

import { AnalisadorSemanticoService } from './analisador-semantico.service';

describe('AnalisadorSemanticoService', () => {
  let service: AnalisadorSemanticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalisadorSemanticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
