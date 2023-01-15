import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '../errors/errors.service';

export class Token {
  token: string = '';
  meaning: string = '';
  line: number = 0;
  col: number = 0;
  /** Linha original dentro da qual a token existe */
  containingLine: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class AnalisadorLexicoService {
  /** Array com os caracteres que compõem o alfabeto válido do LALG */
  private alfabeto =
    '0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_;.,():=<>+-*{}/[]'.split(
      ''
    );
  /** Array com os caracteres que são capazes de dividir tokens */
  private dividers = [
    ' ',
    ';',
    ',',
    '(',
    ')',
    ':',
    '=',
    '<',
    '>',
    '+',
    '-',
    '*',
    '{',
    '}',
    '/',
    '\t',
  ];
  /** Lista de palavras reservadas válidas */
  private reservedWords = [
    { token: 'program', desc: 'programa' },
    { token: ';', desc: 'ponto-e-vírgula' },
    { token: '.', desc: 'ponto-final' },
    { token: ',', desc: 'vírgula' },
    { token: 'procedure', desc: 'procedimento' },
    { token: '(', desc: 'abre-parênteses' },
    { token: ')', desc: 'fecha-parênteses' },
    { token: 'var', desc: 'nova-variável' },
    { token: ':', desc: 'dois-pontos' },
    { token: 'int', desc: 'tipo-inteiro' },
    { token: 'boolean', desc: 'tipo-booleano' },
    { token: 'read', desc: 'entrada-dado' },
    { token: 'write', desc: 'saida-dado' },
    { token: 'true', desc: 'boolean-verdadeiro' },
    { token: 'false', desc: 'boolean-falso' },
    { token: 'begin', desc: 'inicio-bloco' },
    { token: 'end', desc: 'fim-bloco' },
    { token: ':=', desc: 'atribuição' },
    { token: 'if', desc: 'condicional-se' },
    { token: 'then', desc: 'condicional-então' },
    { token: 'else', desc: 'condicional-se-não' },
    { token: 'while', desc: 'repetição-enquanto' },
    { token: 'do', desc: 'repetição-faça' },
    { token: '=', desc: 'comparação-igual' },
    { token: '<>', desc: 'comparação-diferente' },
    { token: '<', desc: 'comparação-menor' },
    { token: '<=', desc: 'comparação-menor-igual' },
    { token: '>=', desc: 'comparação-maior-igual' },
    { token: '>', desc: 'comparação-maior' },
    { token: '+', desc: 'operação-soma' },
    { token: '-', desc: 'operação-subtração' },
    { token: 'or', desc: 'operação-ou' },
    { token: '*', desc: 'operação-produto' },
    { token: 'div', desc: 'operação-divisão' },
    { token: 'and', desc: 'operação-e' },
    { token: 'not', desc: 'operação-não' },
    { token: '[', desc: 'abre-colchete' },
    { token: ']', desc: 'fecha-colchete' },
  ];
  /** token que indica um comentário de uma única linha */
  private commentChar = '/';
  /** Lista de tokens encontradas no código-fonte */
  tokens: Token[] = [];
  /** Observable que emite listas de tokens processadas */
  tokens$ = new BehaviorSubject<Token[]>([]);

  constructor(private errorsService: ErrorsService) {}

  /**
   * Verifica se o caractere char está dentro do alfabeto da linguagem.
   * @param char caractere a validar
   */
  private estaNoAlfabeto(char: string): boolean {
    if (char === '') return false;
    // Os caracteres ' ' (espaço) e '\t' (tabulação) existe para além do alfabeto, mas a função
    // retornará true para o caso dele para que a execução não seja interrompida
    // indevidamente.
    if (char === ' ' || char === '\t') return true;

    return this.alfabeto.includes(char);
  }

  /**
   * Analisa o código-fonte passado na forma de lista de linhas lexicamente.
   * @param text Array contendo linhas de código-fonte
   */
  analisar(text: string[]): void {
    // Limpa todos os erros contidos no serviço de erros para a nova análise
    this.errorsService.limpar();
    this.tokens = [];
    /** Variável responsável por ignorar caracteres em comentários de múltiplas linhas */
    let inComment = false;
    // Varrendo cada linha do editor
    for (let row = 0; row < text.length; row++) {
      const linha = text[row];
      // Se a linha for vazia, ignore-a
      if (linha == '') continue;
      let r = new Token();
      // Varrendo cada coluna da linha
      for (let col = 0; col < linha.length; col++) {
        const caractereAtual = linha[col];
        // Ignora linhas depois de encontrar um comentário
        if (caractereAtual === '{') inComment = true;
        if (inComment && caractereAtual === '}') {
          inComment = false;
          continue;
        }
        if (inComment === true) continue;
        // Caso sejam comentários de uma única linha
        if (
          col < linha.length - 1 &&
          caractereAtual == linha[col + 1] &&
          caractereAtual == this.commentChar
        ) {
          break;
        }
        // Verifica se o caractere é válido no alfabeto
        if (!this.estaNoAlfabeto(caractereAtual)) {
          console.log(`Erro na linha ${row + 1}:${col + 1}!`);
          // Adiciona um erro do tipo 100 ao serviço de erros
          this.errorsService.addErro(100, row, col, linha);
        }
        // Quando encontrar um caractere divisor, deve-se consolidar
        // a token acumulada até o momento
        if (this.dividers.includes(caractereAtual)) {
          if (r.token !== '') {
            r.meaning = this.identificarToken(r.token);
            r.containingLine = linha;
            this.consolidarToken(r, row, col, linha);
            r = new Token();
          }
          // Se o caractere atual for um espaço, pode ignorá-lo
          if (caractereAtual === ' ' || caractereAtual === '\t') continue;

          // Verifica os divisores que tem alternativas de múltiplos caracteres
          if (caractereAtual === ':' && linha[col + 1] === '=') {
            // Caso seja :=
            r.token = ':=';
          } else if (caractereAtual === '>' && linha[col + 1] === '=') {
            // Caso seja >=
            r.token = '>=';
          } else if (caractereAtual === '<') {
            if (linha[col + 1] === '=') r.token = '<='; // Caso seja <=
            else if (linha[col + 1] === '>') r.token = '<>'; // Caso seja <>
            // Esse else é importante porque, caso ele não exista, a token que é apenas '<' não
            // seria processada corretamente
            else r.token = caractereAtual;
          } else r.token = caractereAtual;
          // Adiciona a token de divisor
          r.meaning = this.identificarToken(r.token);
          r.containingLine = linha;
          this.consolidarToken(r, row, col, linha);
          // Caso seja uma token com divisor composta, deve-se saltar 2x no loop de coluna
          if ([':=', '>=', '<=', '<>'].includes(r.token)) {
            col += 1;
          }
          r = new Token();
          continue;
        } else if (caractereAtual === '.' && r.token === 'end') {
          // O algoritmo entra nesse if caso haja um ponto final precedido de um "end",
          // o que indica que o ponto não é um indicador de casa decimal de um número real,
          // mas sim a token ponto-final

          // Consolida o "end"
          r.meaning = this.identificarToken(r.token);
          r.containingLine = linha;
          this.consolidarToken(r, row, col, linha);
          // Consolida a token de ponto
          r = new Token();
          r.token = caractereAtual;
          r.meaning = this.identificarToken(r.token);
          r.containingLine = linha;
          this.consolidarToken(r, row, col, linha);
          r = new Token();
        }
        // Caso não tenha encontrado um caractere divisor ou ponto-final, acumule o caractere
        // atual na token atual
        else r.token += caractereAtual;
      }
      // Adiciona a token restante que está acumulada em r
      if (r.token !== '') {
        r.meaning = this.identificarToken(r.token);
        r.containingLine = linha;
        this.consolidarToken(r, row, linha.length - 1, linha);
      }
    }
    // Se o arquivo acabou e o modo inComment ainda estava true, então
    // faltou fechar o comentário.
    if (inComment) {
      this.errorsService.addErro(
        103,
        text.length - 1,
        text[text.length - 1].length - 1,
        text[text.length - 1]
      );
    }

    this.tokens$.next(this.tokens);
    // Emite os novos valores de erros manualmente
    this.errorsService.emitir();
  }

  /**
   * Consolida uma token, verificando se há algum erro para ser adicionado.
   * @param token Token sendo consolidada
   * @param linha Linha onde a token está
   * @param coluna Coluna onde a token termina
   * @param linhaOriginal Conteúdo original da linha sendo processada
   */
  consolidarToken(
    token: Token,
    linha: number,
    coluna: number,
    linhaOriginal: string
  ): void {
    token.line = linha;
    token.col = coluna - token.token.length;
    this.tokens.push(token);
    if (token.meaning === 'número real mal formatado')
      this.errorsService.addErro(
        101,
        linha,
        coluna < token.token.length ? 0 : coluna - token.token.length,
        linhaOriginal,
        token.token.length
      );
    else if (token.meaning === 'identificador inválido')
      this.errorsService.addErro(
        102,
        linha,
        coluna < token.token.length ? 0 : coluna - token.token.length,
        linhaOriginal,
        token.token.length
      );
    else if (token.meaning === 'identificador muito longo')
      this.errorsService.addErro(
        104,
        linha,
        coluna < token.token.length ? 0 : coluna - token.token.length,
        linhaOriginal,
        token.token.length
      );
    else if (token.meaning === 'número natural muito longo')
      this.errorsService.addErro(
        105,
        linha,
        coluna < token.token.length ? 0 : coluna - token.token.length,
        linhaOriginal,
        token.token.length
      );
  }

  /**
   * Identifica uma token dentre as diversas opções da linguagem.
   * @param token Token a ser identificada
   * @returns string contendo uma descrição da token
   */
  identificarToken(token: string): string {
    const tokenFound = this.reservedWords.find((el) => el.token === token);
    if (tokenFound !== undefined) return tokenFound.desc;
    // Verifica se é um número real
    if (/(^\.\d*$)|(^\d*\.$)/.test(token)) return 'número real mal formatado';
    else if (/^\d+\.\d+$/.test(token)) return 'número real';
    else if (/^\d+$/.test(token))
      if (token.length <= 8) return 'número natural';
      else return 'número natural muito longo';
    else if (/^[a-zA-z_][a-zA-z_0-9]*$/.test(token))
      if (token.length <= 15) return 'identificador válido';
      else return 'identificador muito longo';

    // Caso a token não tenha sido identifciada, retornar que é um identificador inválido
    return 'identificador inválido';
  }
}
