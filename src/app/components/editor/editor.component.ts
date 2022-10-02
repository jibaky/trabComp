import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';
import { Erro, ErrorsService } from 'src/app/services/errors/errors.service';

class EditorLine {
  line: number;
  errors: Erro[] = [];
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  @ViewChild('editor') editorElement: ElementRef;
  @ViewChild('lineNumbersContainer') lineNumbersElement: ElementRef;
  /** Armazena os números das linhas de código-fonte. No futuro será usado para indicar erros também. */
  lineNumbers: number[] = [1];
  /** Guarda o valor do editor de texto a cada processamento para verificar se houveram edições */
  private editorCache: string;
  /** Indica se a análise deve ser executada a cada alteração do conteúdo do editor */
  analiseAoVivo = true;

  constructor(
    private analisadorLexico: AnalisadorLexicoService,
    private errorsService: ErrorsService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Não perguntem. Hax hax hax.
    setTimeout(() => {
      this.parseLines();
    }, 50);

    // Esse trecho diz que toda vez que o BehaviorSubject chamado messages$ emitir novos valores (.next)
    // a função passada como parâmetro deve ser executada.
    this.errorsService.messages$.subscribe((messages: Erro[]) => {
      this.processaErros(messages);
    });
  }

  processaErros(messages: Erro[]): void {
    // Limpa todos os erros do editor de erros para que novos sejam desenhados
    this.resetErros();
    // Desenha na tela cada erro vindo da emissão de messages$
    messages.map((erro: Erro) => this.desenhaErro(erro));
  }

  /**
   * Função responsável por limpar os erros que estão desenhados na tela (cores de linha, etc)
   */
  private resetErros(): void {
    const elements = this.lineNumbersElement.nativeElement.querySelectorAll(
      `.line-number.has-error`
    );
    for (const element of elements) {
      element.classList.remove('has-error');
    }
  }

  desenhaErro(erro: Erro): void {
    const line = this.lineNumbersElement.nativeElement.querySelector(
      `.line-number:nth-child(${erro.line + 1})`
    );
    line.classList.add('has-error');
  }

  /**
   * Gera uma lista com os números de linhas de acordo com a quantidade de linhas escritas no editor.
   */
  parseLines(): void {
    // Se o conteúdo do código-fonte foi alterado, remover os erros que podem ter ficado obsoletos
    // TODO: pensar numa forma melhor de fazer isso
    // if (this.editorElement.nativeElement.value != this.editorCache)
    //   this.resetErros();
    // Conta quantas linhas existem no código-fonte
    const count = this.editorElement.nativeElement.value.split('\n').length;
    // Ajusta a largura do campo de texto em si
    this.ajustaAltura(count);

    while (this.lineNumbers.length < count) {
      this.lineNumbers.push(this.lineNumbers.length);
    }
    while (this.lineNumbers.length > count) {
      this.lineNumbers.pop();
    }

    if (this.analiseAoVivo) this.analisar();

    // Guarda o conteúdo do editor de texto para a próxima comparação
    this.editorCache = this.editorElement.nativeElement.value;
  }

  /**
   * Função necessária para ajustar o tamanho do textarea que contém o código fonte conforme ele cresce
   */
  private ajustaAltura(linhas: number): void {
    /** Altura de cada linha de código (vide o CSS em .editor) */
    const alturaLinha = 27;

    this.editorElement.nativeElement.style.height = `${
      (linhas + 1) * alturaLinha
    }px`;
  }

  analisar(): void {
    const text = this.editorElement.nativeElement.value.split('\n');
    this.analisadorLexico.analisar(text);
  }
}
