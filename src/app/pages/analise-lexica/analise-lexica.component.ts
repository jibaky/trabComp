import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';

@Component({
  selector: 'app-analise-lexica',
  templateUrl: './analise-lexica.component.html',
  styleUrls: ['./analise-lexica.component.scss'],
})
export class AnaliseLexicaComponent implements OnInit {
  @ViewChild('editor') editorElement: ElementRef;
  @ViewChild('lineNumbersContainer') lineNumbersElement: ElementRef;
  /** Armazena os números das linhas de código-fonte. No futuro será usado para indicar erros também. */
  lineNumbers: number[] = [1];

  constructor(private analisadorLexico: AnalisadorLexicoService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Não perguntem. Hax hax hax.
    setTimeout(() => {
      this.parseLines();
    }, 200);
  }

  /**
   * Gera uma lista com os números de linhas de acordo com a quantidade de linhas escritas no editor.
   */
  parseLines(): void {
    const count = this.editorElement.nativeElement.value.split('\n').length;
    this.lineNumbers = [];
    // o comando .unshift() é igual o .push(), mas adiciona o elemento no começo da array
    for (let i = 1; i <= count; i++) this.lineNumbers.unshift(i);
  }

  analisar(): void {
    const text = this.editorElement.nativeElement.value.split('\n');
    this.analisadorLexico.analisar(text);
  }
}
