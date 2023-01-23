import { Injectable } from '@angular/core';
import {
  ColunaSintantica,
  EPSILON,
  Gramatica,
  LinhaSintatica,
  Simbolo,
  TabelaSintatica,
} from 'src/app/gramatica/gramatica.model';
import {
  AnalisadorLexicoService,
  Token,
} from '../analisador-lexico/analisador-lexico.service';
import { AnalisadorSemanticoService } from '../analisador-semantico/analisador-semantico.service';
import { ErrorsService } from '../errors/errors.service';

@Injectable({
  providedIn: 'root',
})
export class AnalisadorGramaticalService {
  /** Representa a entrada de tokens que será validada */
  input: Token[] = [];
  /** Representa a pilha de símbolos da gramática usada na validação */
  stack: string[] = [];
  /** Lista de símbolos não terminais e seus firsts */
  firsts: { simbolo: string; first: string[] }[] = [];
  /** Lista de símbolos não terminais e seus follows */
  follows: { simbolo: string; follow: string[] }[] = [];
  /** Gramática carregada pelo serviço */
  gramatica: Gramatica;
  /**
   * Pilha de símbolos cujo cálculo de first está na pilha de recursão.
   * Esta variável é usada para impedir loops de recursão infinitas. */
  pendingFirstRecursions: string[] = [];
  /**
   * Pilha de símbolos cujo cálculo de follow está na pilha de recursão.
   * Esta variável é usada para impedir loops de recursão infinitas. */
  pendingFollowRecursions: string[] = [];

  /** Tabela sintática carregada com a gramática escolhida */
  tabelaSintatica: TabelaSintatica;

  constructor(
    private analisadorLexico: AnalisadorLexicoService,
    private errorService: ErrorsService,
    private analisadorSemantico: AnalisadorSemanticoService
  ) {}

  /**
   * Reseta os valores e variáveis do serviço para uma nova análise.
   */
  reset(): void {
    this.input = [];
    this.stack = [];
    this.firsts = [];
    this.follows = [];
  }

  /**
   * Carrega uma gramática e prepara seus first(), follow() e tabela sintática preditiva.
   * @param gramatica Gramática a ser carregada no serviço
   */
  selectGrammar(gramatica: Gramatica): void {
    this.gramatica = gramatica;
    this.prepare();
  }

  parse(): void {
    this.analisadorSemantico.reset();
    this.input = [...this.analisadorLexico.tokens$.value];
    const endToken = new Token();
    endToken.token = '$';
    endToken.meaning = '$';
    endToken.col = this.input[this.input.length - 1].col;
    endToken.line = this.input[this.input.length - 1].line;
    endToken.containingLine = this.input[this.input.length - 1].containingLine;
    this.input.push(endToken);
    // console.log('INPUT', this.input);

    this.stack = ['$'];
    const raiz = this.gramatica.regras.find(
      (r) => r.nome === this.gramatica.raiz
    );
    this.stack.push(raiz.nome);
    /** Indica se o compilador chegou ao fim do arquivo com um erro de sincronização */
    let eof = false;
    /** Indica se o compilador está no modo-panico */
    let panicMode = false;
    let lastTerminal: Token;
    while (
      this.stack[this.stack.length - 1] !== '$' ||
      this.input[0].token !== '$'
    ) {
      eof = false;
      let token;
      token = this.input[0];
      if (!token) break;
      if (this.stack[this.stack.length - 1].match(/\[\[.+\]\]/g)) {
        this.semantica(this.stack.pop(), lastTerminal);
        continue;
      }
      // HACK DE MILHÕES para validar identificadores válidos e números via primeiro caractere
      if (
        [
          'número natural',
          'número real',
          'identificador válido',
          'boolean-verdadeiro',
          'boolean-falso',
        ].includes(token.meaning)
      )
        token = {
          ...token,
          token: this.input[0].token[0],
        };

      // console.log('STACK ATUAL:', this.stack);
      // console.log('Token atual:', token);
      // console.log(
      //   `    Comparando entrada [${token.token}] com stack [${
      //     this.stack[this.stack.length - 1]
      //   }]`
      // );
      // O topo da stack é um não-terminal
      if (this.stack[this.stack.length - 1].match(/<.+>/g) !== null) {
        if (this.stack[this.stack.length - 1] === '<identificador>') {
          // console.log('PROCURANDO IDENTIFICADOR VÁLIDO');
          if (
            ![
              'identificador válido',
              'boolean-verdadeiro',
              'boolean-falso',
            ].includes(token.meaning)
          ) {
            const col = token.col < 0 ? 0 : token.col;
            this.errorService.addErro(
              202,
              token.line,
              col,
              token.containingLine,
              token.token.length - 1,
              'O valor encontrado foi ' + token.token
            );
            this.stack.pop();
            lastTerminal = this.input.shift();
            continue;
          }
          // console.log('IDENTIFICADOR VÁLIDO ENCONTRADO');
          this.stack.pop();
          lastTerminal = this.input.shift();
          continue;
        } else if (this.stack[this.stack.length - 1] === '<número>') {
          // console.log('PROCURANDO NÚMERO');
          if (
            token.meaning !== 'número natural' &&
            token.meaning !== 'número real'
          ) {
            const col = token.col < 0 ? 0 : token.col;
            this.errorService.addErro(
              204,
              token.line,
              col,
              token.containingLine,
              token.token.length - 1,
              'O valor encontrado foi ' + token.token
            );
            this.stack.pop();
            lastTerminal = this.input.shift();
            continue;
          }
          // console.log('NUMERO ENCONTRADO');
          this.stack.pop();
          lastTerminal = this.input.shift();
          continue;
        }

        const row = this.tabelaSintatica.row.find(
          (r) => r.header === this.stack[this.stack.length - 1]
        );
        const col = row.col.find((c) => c.header === token.token);
        // console.log('    Produção correta é:', col?.cell);
        const expected = row.col
          .filter((c) => c.cell[0] !== 'TOKEN_SYNC' && c.header !== '$')
          .map((c) => c.header)
          .join(', ');
        if (col === undefined) {
          // if (!panicMode) panicMode = true;
          // else {
          //   this.input.shift();
          //   continue;
          // }
          // console.log('    Erro! Ignorando', token);
          lastTerminal = this.input.shift();
          // Corrige possíveis índices de coluna negativos quando o erro ocorre no primeiro caractere
          const col = token.col < 0 ? 0 : token.col;
          this.errorService.addErro(
            200,
            token.line,
            col,
            token.containingLine,
            token.token.length - 1,
            'Uma destas tokens era esperada: ' + expected
          );
          continue;
        }
        if (col?.cell[0] === 'TOKEN_SYNC') {
          // console.log('    SYNC SYNC SYNC!');
          // panicMode = false;
          if (this.input[0].token !== '$') {
            // this.errorService.addErro(
            //   201,
            //   token.line,
            //   token.col + 1,
            //   token.containingLine,
            //   token.token.length,
            //   'Uma destas tokens era esperada: ' + expected
            // );
            this.stack.pop();
            continue;
          } else {
            // console.log('    Sincronização não tem mais para onde ir: ERRO!');
            this.errorService.addErro(
              203,
              token.line,
              token.containingLine.length - 1,
              token.containingLine,
              1,
              'Uma destas tokens era esperada: ' + expected
            );
            eof = true;
            break;
          }
        }
        this.stack.pop();
        if (col.cell[0] === EPSILON) continue;
        const arrInvertida = [];
        for (const e of col?.cell) arrInvertida.unshift(e);
        this.stack.push(...arrInvertida);
      } else {
        // O todo da stack é um símbolo terminal
        if (this.stack[this.stack.length - 1] === token.token) {
          // console.log('    Match! Avançando entrada');
          lastTerminal = this.input.shift();
          this.stack.pop();
        } else {
          this.stack.pop();
        }
      }
      // console.log('=============================');
    }
    if (
      this.stack[this.stack.length - 1] === '$' &&
      this.input[0].token === '$'
    ) {
      console.log('VALIDADO');
    } else {
      if (!eof)
        this.errorService.addErro(
          203,
          this.input[0].line,
          this.input[0].containingLine.length - 1,
          this.input[0].containingLine,
          1,
          this.stack[this.stack.length - 1] === '$'
            ? undefined
            : this.stack[this.stack.length - 1] + ' esperado.'
        );
    }
    this.errorService.emitir();
  }

  /**
   * Prepara o serviço a partir da gramática carregada:
   *     - calcula os first() dos símbolos da gramática
   *     - calcula os follow() dos símbolos da gramática
   *     - monta a tabela sintática da gramática
   */
  prepare(): void {
    if (!this.gramatica) return;
    this.reset();
    this.analisadorSemantico.reset();
    console.log('parsing with gramatica:', this.gramatica);

    this.firsts = this.calcularFirsts();
    this.calcularFollows();
    this.tabelaSintatica = this.calcularTabelaSintatica();

    console.log(this.firsts);
    console.log(this.follows);
  }

  /**
   * Calcula os conjuntos first() para todos os não-terminais (<Não-terminal>) da gramática.
   * @returns Retorna uma lista de símbolos, cada um com sua lista de first()
   */
  calcularFirsts(): { simbolo: string; first: string[] }[] {
    const firsts = [];
    for (const simbolo of this.gramatica.regras) {
      // Caso seja um símbolo terminal, passe para o próximo
      if (simbolo.deriv.length === 0) continue;
      /** Símbolo não-terminal atual cujos first() serão calculados */
      const current = { simbolo: simbolo.nome, first: [] };
      // Regra 1: Se um dado não-terminal <X> tiver uma produção do tipo X -> aα e a é terminal,
      // então a é parte de first(<X>)
      current.first = this.findFirstFor(simbolo.nome);
      firsts.push(current);
    }
    return firsts;
  }

  /**
   * Calcula os first de um dado símbolo e retorna uma lista com eles.
   * @param s simbolo terminal ou não-terminal cujos first() serão calculados
   * @returns lista first() para simbolo
   */
  findFirstFor(s: string): string[] {
    /** Lista de simbolos terminais que são first() de s */
    const first: Set<string> = new Set();
    /** objeto Simbolo para o terminal ou não-terminal s */
    const simbolo = this.gramatica.regras.filter(
      (r: Simbolo) => r.nome === s
    )[0];
    // console.log(s);
    if (!simbolo) {
      console.error('Erro de gramática: simbolo não encontrado.');
      return [];
    }
    // console.log(`Calculando first(${simbolo.nome})`);
    this.pendingFirstRecursions.push(simbolo.nome);
    // console.log('Pilha de recursão [push]:', this.pendingFirstRecursions);
    for (const producao of simbolo.deriv) {
      // Para cada símbolo em uma dada produção
      for (const parte of producao) {
        // console.log(`Analisando símbolo ${parte}`);
        if (parte.match(/\[\[.+\]\]/g)) {
          continue;
        }
        // Se o simbolo for não-terminal, no formato <simbolo não terminal>
        if (parte.match(/<.+>/g) !== null && parte !== simbolo.nome) {
          let currentFirsts: string[];
          if (!this.pendingFirstRecursions.includes(parte)) {
            // Regra 2: dado um <X> não-terminal que tem uma produção <X> -> <A>, então
            // first(<A>) faz parte de first(<X>)
            currentFirsts = this.findFirstFor(parte).map((element) => {
              first.add(element);
              return element;
            });
            // Regra 4: se um dado <X> não-terminal tem uma produção -> <A><B> e
            // first(<A>) contém ε, então first(<X>) inclui first(<B>) também
            // console.log(
            //   `first(${parte}) contém ε?`,
            //   currentFirsts.includes(EPSILON)
            // );
            if (!currentFirsts.includes(EPSILON)) break;
          }
        } else {
          // Regra 3: dado um símbolo terminal a, first(a) = {a}
          // console.log(`Adicionando "${parte}" a first(${simbolo.nome})`);
          first.add(parte);
          break;
        }
      }
    }
    this.pendingFirstRecursions.pop();
    // console.log('Pilha de recursão [pop]:', this.pendingFirstRecursions);
    // console.log(`Satisfeito com first(${simbolo.nome}):`, first);
    return Array.from(first);
  }

  /**
   * Calcula os conjuntos follow() para todos os não-terminais (<Não-terminal>) da gramática.
   * Não retorna uma lista, mas preenche this.follow com a lista de símbolos,
   * cada um com sua lista de follow().
   */
  calcularFollows(): void {
    for (const simbolo of this.gramatica.regras) {
      // console.log('Próxima regra:', simbolo.nome);
      // Caso seja um símbolo terminal, passe para o próximo
      if (simbolo.deriv.length === 0) continue;
      /** Símbolo não-terminal atual cujos first() serão calculados */
      const current = { simbolo: simbolo.nome, follow: [] };
      current.follow = this.findFollowsFor(simbolo.nome);
      // console.log('Satisfeito com', current.simbolo, '=>', current.follow);
      this.follows.push(current);
    }
  }

  /**
   * Calcula recursivamente os follow() do não-terminal s.
   * @param s Símbolo cujos follow() serão calculados
   * @returns Lista de terminais que compõem follow(s)
   */
  findFollowsFor(s: string): string[] {
    /** Lista de simbolos terminais que são follow() de s */
    const follow: Set<string> = new Set();
    const hasFollows = this.follows.find((f) => f.simbolo === s);
    // if (hasFollows) console.log(`follow(${s}):`, hasFollows);
    if (hasFollows !== undefined) return hasFollows.follow;
    // Regra 1: Se um dado não-temrinal <X> é raiz, então $ é parte de follow(<X>)
    if (s === this.gramatica.raiz) follow.add('$');
    // console.log('finding follows() for:', s);
    if (this.pendingFollowRecursions.includes(s)) {
      // console.log(`Pilha de recursão já possui ${s}. Ignorando-o.`);
      return [];
    }
    this.pendingFollowRecursions.push(s);
    // console.log(`Pilha de recursão [push]:`, this.pendingFollowRecursions);
    /** lista de Símbolos que derivam em s */
    const simbolos = this.gramatica.regras.filter(
      (r: Simbolo) =>
        r.deriv.filter((d) => d.filter((element) => element === s).length > 0)
          .length > 0
    );
    if (simbolos.length === 0) {
      // console.error('Simbolo não encontrado.', s, 'Seria ele a raiz?');
      return s === this.gramatica.raiz ? ['$'] : [];
    }
    // console.log('rules to check:', simbolos);
    for (const simbolo of simbolos) {
      for (const producao of simbolo.deriv) {
        let parteAnterior = null;
        // Regra 2: Se existe uma produção do tipo <A> -> α<X>β onde β != ε, então
        // first(β), exceto ε, é parte de follow(<X>)
        for (const parte of producao) {
          if (parte.match(/\[\[.+\]\]/g)) {
            continue;
          }
          if (
            parteAnterior === s &&
            parteAnterior !== null &&
            parteAnterior.match(/<.+>/g) !== null
          ) {
            // first(current) pode ser não-terminal (buscar na lista de firsts) ou temrinal (first(a) = {a})
            const firstDoCurrent =
              parte.match(/<.+>/g) !== null
                ? this.firsts.filter((f) => f.simbolo === parte)[0]
                : { simbolo: parte, first: [parte] };
            // console.log(parte, 'recebe follow() de', simbolo.nome);
            if (!firstDoCurrent)
              console.error('ERRO: first(current) não econtrado.');

            firstDoCurrent.first
              .filter((f) => f !== EPSILON)
              .map((f) => follow.add(f));
            // Regra 3: Se existe uma produção do tipo <A> -> α<X> ou <A> -> α<X>β onde
            // first(β) contém ε, então follow(<X>) deve conter follow(<A>)
            if (firstDoCurrent.first.includes(EPSILON)) {
              // console.log(
              //   `${simbolo.nome} -> α${parteAnterior}${parte} onde first(${parte}) contém ε`
              // );
              this.findFollowsFor(simbolo.nome).map((s) => follow.add(s));
              // console.log('=====');
              // console.log(follow);
            }
          }
          parteAnterior = parte;
        }
        // Regra 3: parte <A> -> α<X>
        if (
          parteAnterior.match(/<.+>/g) !== null &&
          parteAnterior === s &&
          simbolo.nome !== parteAnterior
        ) {
          // console.log(
          //   `${simbolo.nome} -> α${parteAnterior} portanto follow(${parteAnterior}) += follow(${simbolo.nome})`
          // );
          this.findFollowsFor(simbolo.nome).map((s) => follow.add(s));
        }
      }
    }
    this.pendingFollowRecursions.pop();
    // console.log(`Pilha de recursão [pop]:`, this.pendingFollowRecursions);
    // console.log('returning follow for', s, follow);
    return Array.from(follow);
  }

  calcularTabelaSintatica(): TabelaSintatica {
    /** Tabela sintática a ser montada usando os first() e follow() da gramática */
    const tabela = new TabelaSintatica();

    for (const naoTerminal of this.firsts) {
      const row = new LinhaSintatica(naoTerminal.simbolo);
      const simbolo = this.gramatica.regras.find(
        (r) => r.nome === naoTerminal.simbolo
      );
      // console.log('=== START ', naoTerminal);
      for (const producao of simbolo.deriv) {
        for (const parte of producao) {
          // console.log('parte atual da derivação', parte);
          const first = this.firsts.find((f) => f.simbolo === parte) || {
            simbolo: parte,
            first: [parte],
          };
          let foundEpsilon = false;
          // Regra 1: Na produção A -> α, para cada x terminal em first(α), adicionar A -> α em Tabela[A, x]
          for (const terminal of first.first) {
            // Regra 2: Se first(α) contém ε, adicione A -> α a M[A, b] para cada terminal b que estiver em
            // follow(A).
            if (terminal === EPSILON) {
              foundEpsilon = true;
              // console.log(naoTerminal.simbolo, 'Achou ε em first(α)');
              const follow = this.follows.find(
                (f) => f.simbolo === simbolo.nome
              );
              // console.log('==> ', naoTerminal.simbolo, 'Inicio loop ε:');

              for (const terminal of follow.follow) {
                // É importante verificar se um dado terminal dentro de follow(A) já não está em first(α)
                // para evitar confusões
                const found = row.col.findIndex(
                  (col) => col.header === terminal
                );
                if (found !== -1) continue;
                // console.log('    ', naoTerminal.simbolo, 'Regra 2:', terminal, found !== -1);
                // Adiciona A -> ε a M[A, b] onde b está em follow(A) e é igual a ε
                const col = new ColunaSintantica(terminal);
                col.cell = [EPSILON];
                row.col.push(col);
              }
              // console.log('==> ', naoTerminal.simbolo, 'Fim loop ε.');
              continue;
            }
            // console.log(naoTerminal.simbolo, 'Regra 1:', terminal, producao);
            // Caso a coluna não exista, crie uma nova, caso contrário, sobrescreva sua cell pela produção encontrada
            const existingCol = row.col.find((col) => col.header === terminal);
            const col =
              existingCol !== undefined
                ? existingCol
                : new ColunaSintantica(terminal);
            col.cell = producao;
            if (existingCol === undefined) row.col.push(col);
          }
          if (!foundEpsilon) break;
        }
      }
      // console.log('=== FIM ', naoTerminal);
      // Agora é hora de adicionar as tokens de sincronização, que serão usadas para tentar recuperar a
      // análise sintática de uma situação de erro. As células que vão receber a token de sincronização
      // serão, para cada não-terminal, as células correspondentes aos terminais que compõem seu follow()
      const follow = this.follows.find((f) => f.simbolo === simbolo.nome);
      if (follow) {
        for (const terminal of follow.follow) {
          const found = row.col.findIndex((col) => col.header === terminal);
          // console.log('=> ', simbolo.nome, terminal, found);
          if (found === -1) {
            const col = new ColunaSintantica(terminal);
            col.cell = ['TOKEN_SYNC'];
            row.col.push(col);
          }
        }
      }
      tabela.row.push(row);
    }

    console.log('tabela sintática:', tabela);

    return tabela;
  }

  semanticaTipo: string;
  semanticaVar: Token;

  semantica(token: string, prev: Token): void {
    if (token === '[[programa_nome]]') {
      console.log('[SEMANTICA] Nome do programa', prev);
      this.analisadorSemantico.add(
        prev.token,
        prev.meaning,
        'nome_prog',
        '-',
        0
      );
    } else if (token === '[[declaração_tipo]]') {
      console.log('[SEMANTICA] Declaração de variáveis: tipo', prev);
      this.semanticaTipo = prev.token;
    } else if (token === '[[declaração_id]]') {
      console.log('[SEMANTICA] Declaração de variáveis: var', prev);
      if (this.semanticaTipo !== 'int' && this.semanticaTipo !== 'boolean')
        console.log('WTF TIPO?');
      if (this.analisadorSemantico.check(prev.token, 'var')) {
        this.errorService.addErro(
          301,
          prev.line,
          prev.col,
          prev.containingLine,
          prev.token.length - 1,
          `A variável ${prev.token} já foi declarada anteriormente.`
        );
      } else {
        this.analisadorSemantico.add(
          prev.token,
          prev.meaning,
          'var',
          this.semanticaTipo === 'int' ? 'int' : 'boolean',
          0
        );
      }
    } else if (token === '[[atribuição_var]]') {
      this.semanticaVar = prev;
    } else if (token === '[[atribuição_value]]') {
      const v = this.analisadorSemantico.find(this.semanticaVar.token, 'var');
      if (v === undefined)
        this.errorService.addErro(
          302,
          this.semanticaVar.line,
          this.semanticaVar.col,
          this.semanticaVar.containingLine,
          this.semanticaVar.token.length - 1,
          `Declare ${this.semanticaVar.token} antes de utilizá-la.`
        );
      else if (
        (v.tipo === 'int' &&
          !['número real', 'número natural'].includes(prev.meaning)) ||
        (v.tipo === 'boolean' &&
          !['boolean-falso', 'boolean-verdadeiro'].includes(prev.meaning))
      )
        this.errorService.addErro(
          303,
          prev.line,
          prev.col,
          prev.containingLine,
          prev.token.length - 1,
          `A variável ${this.semanticaVar.token} é ${v.tipo}, mas o valor atribuído é do tipo ${prev.meaning}.`
        );
      else if (v.tipo === 'int') v.valor = Number(prev.token);
      else if (v.tipo === 'boolean') v.valor = prev.token === 'true' ? 1 : 0;
    } else if (token === '[[variável_uso]]') {
      const v = this.analisadorSemantico.find(prev.token, 'var');
      if (v !== undefined && !v.utilizada) v.utilizada = true;
    } else if (token === '[[variável_nao_utilizada]]') {
      const l = this.analisadorSemantico.simbolos$.value.filter(
        (line) => line.categoria === 'var' && !line.utilizada
      );
      for (const line of l) {
        this.errorService.addErro(
          304,
          prev.line,
          prev.col + 1,
          prev.containingLine,
          1,
          `a variável ${line.cadeia} foi declarada, mas não utilizada.`
        );
      }
    }
  }
}
