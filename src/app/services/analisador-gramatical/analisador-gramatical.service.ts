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
    private errorService: ErrorsService
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
    while (
      this.stack[this.stack.length - 1] !== '$' ||
      this.input[0].token !== '$'
    ) {
      eof = false;
      const token = this.input[0];
      // console.log('STACK ATUAL:', this.stack);
      // console.log('Token atual:', token);
      // console.log(
      //   `    Comparando entrada [${token.token}] com stack [${
      //     this.stack[this.stack.length - 1]
      //   }]`
      // );
      // O topo da stack é um não-terminal
      if (this.stack[this.stack.length - 1].match(/<.+>/g) !== null) {
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
          // console.log('    Erro! Ignorando', token);
          this.input.shift();
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
          if (this.input[0].token !== '$') {
            this.errorService.addErro(
              201,
              token.line,
              token.col + 1,
              token.containingLine,
              token.token.length,
              'Uma destas tokens era esperada: ' + expected
            );
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
          this.input.shift();
          this.stack.pop();
        } else break;
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
            // console.log(parteAnterior, 'recebe first() de', firstDoCurrent);
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
      for (const producao of simbolo.deriv) {
        const first = this.firsts.find((f) => f.simbolo === producao[0]) || {
          simbolo: producao[0],
          first: [producao[0]],
        };
        // Regra 1: Na produção A -> α, para cada x terminal em first(α), adicionar A -> α em Tabela[A, x]
        for (const terminal of first.first) {
          // Regra 2: Se first(α) contém ε, adicione A -> α a M[A, b] para cada terminal b que estiver em
          // follow(A).
          if (terminal === EPSILON) {
            // console.log(naoTerminal.simbolo, 'Achou ε em first(α)');
            const follow = this.follows.find((f) => f.simbolo === simbolo.nome);
            // console.log('==> ', naoTerminal.simbolo, 'Inicio loop ε:');

            for (const terminal of follow.follow) {
              // É importante verificar se um dado terminal dentro de follow(A) já não está em first(α)
              // para evitar confusões
              const found = row.col.findIndex((col) => col.header === terminal);
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
      }
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
}
