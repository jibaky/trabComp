import { Component, OnInit } from '@angular/core';

class Token {
  token: string = '';
  meaning: string = '';
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }
  textExp: any = ''

  /** Lista de tokens que dividem os numeros da calculadora */
  dividers = '+-*/()'.split('');
  alfabeto = '+-*/.1234567890()'.split('');
  results: Token[] = [];
  
  reNAT = /^\d*$/;
  reREA = /^\d+\.\d+$/;
  reAP = /^\($/;
  reFP = /^\)$/;
  reOPSUM = /^\+$/;
  reOPSUB = /^\-$/;
  reOPMUL = /^\*$/;
  reOPDIV = /^\/$/;

  ngOnInit(): void { }

  parseByDivider(text: string): void {
    this.results = [];
    // remove todos os espaços da string por
    let r = new Token();
    for(let i = 0; i<text.length; i++){
      // if (text[i] == ' ') {
      //   if (r.token != ''){
      //     r.meaning = this.identifyToken(r.token);
      //     this.results.push(r);
      //     r = new Token();
      //   }
      //   continue;
      // }
      if (!this.alfabeto.includes(text[i])){
        if (r.token != ''){
          r.meaning = this.identifyToken(r.token);
          this.results.push(r);
          r = new Token();
        }
        if (text[i] !== ' ') {
          r.token = text[i];
          r.meaning = this.identifyToken(r.token);
          this.results.push(r);
          r = new Token();
        }
        continue; 
      }
      // Caso não seja um operador (divider), acumule o caractere na token
      if(!this.dividers.includes(text[i])){
        r.token += text[i];
      } else {
        // Caso seja um operador, identifique a token acumulada
        if (r.token !== '') {
          r.meaning = this.identifyToken(r.token);
          this.results.push(r);
        } 
        r = new Token();
        // Agora identifique a token do operador (text[i] atual)
        r.token = text[i];
        r.meaning = this.identifyToken(r.token);
        this.results.push(r);
        // Prepara um novo Token para a próxima volta do loop
        r = new Token();
      }
    }
    if (r.token !== '') {
      r.meaning = this.identifyToken(r.token);
      this.results.push(r);
    }
  }

  identifyToken(token: string): string {
    if(this.reNAT.test(token)) return 'Número natural';
    else if(this.reREA.test(token)) return 'Número real';
    else if(this.reAP.test(token)) return 'Abre parênteses';
    else if(this.reFP.test(token)) return 'Fecha parênteses';
    else if(this.reOPSUM.test(token)) return 'Operação soma';
    else if(this.reOPSUB.test(token)) return 'Operação substração';
    else if(this.reOPMUL.test(token)) return 'Operação multiplicação';
    else if(this.reOPDIV.test(token)) return 'Operação divisão';

    // verificação de erros
    if (/(^\.\d*$)|(^\d*\.$)/.test(token)) return 'Número real mal formatado';
    

    return 'TOKEN DESCONHECIDA';
  }

  analizadorLexico(text: any): void {
    let words = text.split(' ')
    for(let i = 0; i<words.length; i++){
      const r = new Token();
      r.token = words[i];
      if(this.reNAT.test(words[i])){
        r.meaning = 'Número natural';
      }
      else if(this.reREA.test(words[i])){
        r.meaning = 'Número real';
      }
      else if(this.reAP.test(words[i])){
        r.meaning = 'Abre parênteses';
      }
      else if(this.reFP.test(words[i])){
        r.meaning = 'Fecha parênteses';
      }
      else if(this.reOPSUM.test(words[i])){
        r.meaning = 'Operação soma';
      }
      else if(this.reOPSUB.test(words[i])){
        r.meaning = 'Operação substração';
      }
      else if(this.reOPMUL.test(words[i])){
        r.meaning = 'Operação multiplicação';
      }
      else if(this.reOPDIV.test(words[i])){
        r.meaning = 'Operação divisão';
      }
      this.results.push(r); 
    }
  }
}
