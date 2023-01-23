import { Component, OnInit } from '@angular/core';
import {
  AnalisadorSemanticoService,
  LinhaSimbolo,
} from 'src/app/services/analisador-semantico/analisador-semantico.service';

@Component({
  selector: 'app-simbolos',
  templateUrl: './simbolos.component.html',
  styleUrls: ['./simbolos.component.scss'],
})
export class SimbolosComponent implements OnInit {
  columnsToDisplay: string[] = [
    'cadeia',
    'token',
    'categoria',
    'tipo',
    'valor',
    'utilizada',
  ];

  constructor(public analisadorSemanticoService: AnalisadorSemanticoService) {}

  ngOnInit(): void {
    this.analisadorSemanticoService.simbolos$.subscribe(
      (simbolos: LinhaSimbolo[]) => {
        // console.log('tokens arrived', tokens);
      }
    );
  }
}
