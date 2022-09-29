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
  ];

  private messages: Erro[] = [];

  messages$ = new BehaviorSubject<Erro[]>([]);

  constructor() {}

  /**
   * Limpa todos as mensagens de erro do serviço.
   */
  limpar(): void {
    this.messages = [];
  }

  /**
   * Adiciona um novo erro à lista de erros que pode ou não ser imediatamente emitida no final do comando.
   * @param code código do erro
   * @param line linha onde o erro ocorreu
   * @param column coluna da linha onde o erro ocorreu
   * @param emit emite imediatamente uma nova lista de erros caso seja true
   */
  addErro(
    code: number,
    line: number,
    column: number,
    emit: boolean = false
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
    novoErro.line = line;
    novoErro.column = column;
    // Adiciona o novo erro à lista de erros do serviço
    this.messages.push(novoErro);

    if (emit) this.messages$.next(this.messages);
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
