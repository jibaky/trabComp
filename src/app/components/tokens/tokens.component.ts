import { Component, OnInit } from '@angular/core';
import {
  AnalisadorLexicoService,
  Token,
} from 'src/app/services/analisador-lexico/analisador-lexico.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss'],
})
export class TokensComponent implements OnInit {
  columnsToDisplay: string[] = ['token', 'meaning'];

  constructor(public analisadorLexicoService: AnalisadorLexicoService) {}

  ngOnInit(): void {
    this.analisadorLexicoService.tokens$.subscribe((tokens: Token[]) => {
      console.log('tokens arrived', tokens);
    });
  }
}
