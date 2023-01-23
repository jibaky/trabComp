import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Classe responsável por representar cada mensagem de erro no código-fonte */
export class Erro {
  /** linha onde o erro ocorreu */
  line: number;
  /** coluna onde está o caractere inicial do erro */
  column: number;
  /** descrição do erro */
  text: string;
  /** Código do erro para referência */
  code: number;
  /** Armazena a linha de código que originou o erro formatada para destacar o erro */
  formattedLine: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  /** Lista de mensagens de erros do LALG */
  private errorMessages = [
    {
      code: 100,
      message:
        'Caractere inválido. Verifique se o caractere é parte do alfabeto do LALG.',
    },
    {
      code: 101,
      message:
        'Número real mal-formado. Todo número real deve ser no formato <int>.<int>.',
    },
    {
      code: 102,
      message:
        'Identificador inválido. Um identificador válido deve começar com letra ou _ (underline).',
    },
    {
      code: 103,
      message:
        'Fim inesperado do arquivo. Você se lembrou de fechar todas as chaves que abriu?',
    },
    {
      code: 104,
      message:
        'Identificador maior que 15 caracteres. Diminua o tamanho do identificador.',
    },
    {
      code: 105,
      message: 'Naturais com mais que 8 dígitos não são suportados.',
    },
    {
      code: 200,
      message: 'Token inesperada. Verifique a sintaxe.',
    },
    {
      code: 201,
      message: 'Token inesperada. Verifique a sintaxe. Tentando sincronizar.',
    },
    {
      code: 202,
      message:
        'Identificador inválido encontrado. Um identificador válido deve começar com letra ou _ (underline).',
    },
    {
      code: 203,
      message: 'Fim de arquivo inesperado. Token esperada não foi encontrada.',
    },
    {
      code: 204,
      message: 'Número esperado não foi encontrado. Verifique a formatação.',
    },
    {
      code: 301,
      message: 'Sobrescrita de declarações de variáveis é proibida.',
    },
    {
      code: 302,
      message: 'Variável não declarada detectada.',
    },
    {
      code: 303,
      message: 'Tipos incompatíveis detectados.',
    },
    {
      code: 304,
      message: 'Erro semântico: ',
    },
  ];

  private messages: Erro[] = [];

  messages$ = new BehaviorSubject<Erro[]>([]);

  constructor() {}

  /**
   * Limpa todos as mensagens de erro do serviço.
   */
  limpar(): void {
    this.messages = [];
    this.emitir();
  }

  /**
   * Adiciona um novo erro à lista de erros que pode ou não ser imediatamente emitida no final do comando.
   * @param code código do erro
   * @param line linha onde o erro ocorreu
   * @param column coluna da linha onde o erro ocorreu
   * @param linhaOriginal conteúdo original da linha que causou o erro
   * @param length valor opcional indicando a largura da região para destacar como erro
   * @param length valor opcional indicando a largura da região para destacar como erro
   * @param extras string opcional contendo mais informações passadas pelo componente que chamou a função
   */
  addErro(
    code: number,
    line: number,
    column: number,
    linhaOriginal: string,
    length?: number,
    extras?: string
  ): void {
    if (line < 0 || column < 0) return;

    // Busca a mensagem de erro que tenha o código == code
    const errorMessage = this.errorMessages.find((error) => error.code == code);
    // Verifica se o código de erro foi encontrado na lista de erros válidos
    if (errorMessage === undefined) {
      throw `Código com erro ${code} não existe em \`ErrorsService.errorMessages\`.`;
    }
    // Cria um novo objeto de Erro para ser adicionado à lista de erros do serviço
    const novoErro = new Erro();
    novoErro.code = code;
    novoErro.text = errorMessage.message;
    if (extras) {
      novoErro.text += ' ' + extras;
    }
    novoErro.line = line;
    novoErro.column = column;
    novoErro.formattedLine = this.formatarLinha(linhaOriginal, column, length);

    // Adiciona o novo erro à lista de erros do serviço
    this.messages.push(novoErro);

    this.messages$.next(this.messages);
  }

  /**
   * Formata uma linha de erro usando HTML
   * @param linha Conteúdo da linha com erro
   * @param col Coluna onde o erro foi encontrado
   * @param length Largura opcional que indica o tamanho do trecho com erro
   * @returns string formatada em HTML
   */
  private formatarLinha(linha: string, col: number, length?: number): string {
    let part;
    if (!length || length === 1) {
      part = linha
        .slice(col)
        .replace(
          linha[col],
          `<span class="destaque-erro">${linha[col]}</span>`
        );
    } else {
      const substr = linha.substring(col, col + length + 1);
      part = linha
        .slice(col)
        .replace(substr, `<span class="destaque-erro">${substr}</span>`);
    }
    return linha.substring(0, col) + part;
  }

  /**
   * Função responsável por delegar a emissão de erros para outros componentes e serviços.
   * Quando um outro componente quer emitir novos erros manualmente, ele deve chamar essa função.
   * Isso serve para que o programador possa optar por emitir ou não imediatamente ao usar a função
   * .addErro() ou emitir todos os erros de uma vez só manualmente.
   */
  emitir(): void {
    this.messages$.next(this.messages);
  }
}
