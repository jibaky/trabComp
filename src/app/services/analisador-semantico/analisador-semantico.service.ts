import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class LinhaSimbolo {
  cadeia: string;
  token: string;
  categoria: string;
  tipo: 'int' | 'boolean' | '-' = '-';
  valor: number | null;
  escopo: string = 'main';
  utilizada = false;
}

@Injectable({
  providedIn: 'root',
})
export class AnalisadorSemanticoService {
  tabelaDeSimbolos: LinhaSimbolo[] = [];

  simbolos$ = new BehaviorSubject<LinhaSimbolo[]>([]);

  constructor() {
    // const teste = new LinhaSimbolo();
    // teste.cadeia = 'teste_do_rafa';
    // teste.token = 'id';
    // teste.categoria = 'var';
    // teste.tipo = 'int';
    // teste.valor = 666;
    // teste.escopo = 'main';
    // teste.utilizada = false;
    // this.tabelaDeSimbolos.push(teste);
    // this.simbolos$.next(this.tabelaDeSimbolos);
  }

  add(
    cadeia: string,
    token: string,
    categoria: string,
    tipo: 'int' | 'boolean' | '-',
    valor: number | null
  ): void {
    const newLine = new LinhaSimbolo();
    newLine.cadeia = cadeia;
    newLine.token = token;
    newLine.categoria = categoria;
    newLine.tipo = tipo;
    newLine.valor = valor;
    newLine.escopo = 'main';
    newLine.utilizada = false;
    this.tabelaDeSimbolos.push(newLine);

    this.simbolos$.next(this.tabelaDeSimbolos);
  }

  check(cadeia: string, categoria: string): boolean {
    return (
      this.tabelaDeSimbolos.find(
        (el) => el.cadeia === cadeia && el.categoria === categoria
      ) !== undefined
    );
  }

  find(cadeia: string, categoria: string): LinhaSimbolo {
    return this.tabelaDeSimbolos.find(
      (el) => el.cadeia === cadeia && el.categoria === categoria
    );
  }

  reset(): void {
    this.tabelaDeSimbolos = [];
    this.simbolos$.next([]);
  }
}
