/** Constante que facilita escrever o epsilon :) */
export const EPSILON = 'ε';

/** Simbolo de uma gramática e suas derivações, usado para representar uma regra da gramática. */
export class Simbolo {
  /**
   * nome do símbolo, terminal ou não-terminal. Não-terminais DEVEM ser
   * escritos no formato <nome do simbolo>
   */
  nome: string;
  /** Lista de produções do símbolo. Caso seja terminal, deriv === [] */
  deriv: string[][];
  constructor(nome: string, deriv: string[][]) {
    this.nome = nome;
    this.deriv = deriv;
  }
}

/** Representa uma gramática LL(1) que contém uma raiz e regras de produçaõ. */
export class Gramatica {
  /** Raiz não terminal no formato <simbolo> */
  raiz: string;
  /** Lista de regras de produção que compõem a gramática. */
  regras: Simbolo[] = [];
}

/**
 * Tabela sintática para análise sintática, onde as linhas são os símbolos <não-terminais> e as
 * colunas são os terminais. Cada célula contém a produção correta que gera terminal a partir de
 * <não-terminal> ou um erro.
 */
export class TabelaSintatica {
  /** Cada linha da tabela sintática, contendo um <não-terminal> como cabeçalho e cada terminal como coluna */
  row: LinhaSintatica[] = [];
}

/** Uma linha da tabela sintática. */
export class LinhaSintatica {
  /** nome do símbolo <não-terminal> do qual células da linha derivam. */
  header: string;
  /** Lista de colunas da tabela sintática */
  col: ColunaSintantica[] = [];

  constructor(header: string) {
    this.header = header;
  }
}

/** Uma coluna da tabela sintática */
export class ColunaSintantica {
  /** nome do símbolo terminal que será alcançado ao derivar cell */
  header: string;
  /** célula da tabela sintática, que contém a derivação que leva ao símbolo terminal em header.  */
  cell: string[] = [];

  constructor(header: string) {
    this.header = header;
  }
}
