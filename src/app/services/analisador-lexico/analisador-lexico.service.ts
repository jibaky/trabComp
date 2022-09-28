import { Injectable } from '@angular/core';

class Token {
  token: string = '';
  meaning: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class AnalisadorLexicoService {
  /** Array com os caracteres que compõem o alfabeto válido do LALG */
  private alfabeto =
    '0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_;.,():=<>+-*{}/'.split(
      ''
    );

  constructor() {}

  /**
   * Verifica se o caractere char está dentro do alfabeto da linguagem.
   * @param char caractere a validar
   */
  private estaNoAlfabeto(char: string): boolean {
    if (char === '') return false;
    // O caractere ' ' (espaço) existe para além do alfabeto, mas a função
    // retornará true para o caso dele para que a execução não seja interrompida
    // indevidamente.
    if (char === ' ') return true;

    return this.alfabeto.includes(char);
  }

  /**
   * Analisa o código-fonte passado na forma de lista de linhas lexicamente.
   * @param text Array contendo linhas de código-fonte
   */
  analisar(text: string[]): void {
    // Varrendo cada linha do editor
    for (let row = 0; row < text.length; row++) {
      const linha = text[row];
      const r = new Token();
      // Varrendo cada coluna da linha
      for (let col = 0; col < linha.length; col++) {
        const caractereAtual = linha[col];
        // Verifica se o caractere é válido no alfabeto
        if (!this.estaNoAlfabeto(caractereAtual)) {
          console.log(`Erro na linha ${row + 1}:${col + 1}!`);
          continue;
        }
      }
    }
  }
}
