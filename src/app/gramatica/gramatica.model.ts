/** Constante que facilita escrever o epsilon :) */
export const EPSILON = 'ε';

export class Simbolo {
  nome: string;
  deriv: string[][];
  constructor(nome: string, deriv: string[][]) {
    this.nome = nome;
    this.deriv = deriv;
  }
}

export class Gramatica {
  raiz: string;
  regras: Simbolo[] = [];
}
