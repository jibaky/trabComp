import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';
import { Erro, ErrorsService } from 'src/app/services/errors/errors.service';
import { FilemanagerService } from 'src/app/services/filemanager/filemanager.service';

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
  @ViewChildren('lineNumberItem') lineNumberElement: QueryList<any>;
  /** Armazena os números das linhas de código-fonte. No futuro será usado para indicar erros também. */
  lineNumbers: number[] = [1];
  /** Guarda o valor do editor de texto a cada processamento para verificar se houveram edições */
  private editorCache: string;
  /** Indica se a análise deve ser executada a cada alteração do conteúdo do editor */
  analiseAoVivo = true;

  constructor(
    public analisadorLexico: AnalisadorLexicoService,
    private errorsService: ErrorsService,
    private fileManagerService: FilemanagerService
  ) {}

  ngOnInit(): void {
    this.fileManagerService.novoArquivo$.subscribe((content: string) => {
      if (content == '') return;
      this.editorElement.nativeElement.value = content;
      this.parseLines();
    });
  }

  ngAfterViewInit(): void {
    // Não perguntem. Hax hax hax.
    setTimeout(() => {
      this.parseLines();
    }, 50);

    this.lineNumberElement.changes.subscribe((t) => {
      this.ngForRendered();
    });

    // Esse trecho diz que toda vez que o BehaviorSubject chamado messages$ emitir novos valores (.next)
    // a função passada como parâmetro deve ser executada.
    this.errorsService.messages$.subscribe((messages: Erro[]) => {
      this.processaErros(messages);
    });
  }

  ngForRendered(): void {
    if (this.analiseAoVivo)
      this.processaErros(this.errorsService.messages$.value);
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
    line?.classList.add('has-error');
  }

  /**
   * Gera uma lista com os números de linhas de acordo com a quantidade de linhas escritas no editor.
   */
  parseLines(e: KeyboardEvent | null = null): void {
    /** Indica se o texto foi alterado desde a última execução da função */
    const alterado = this.editorElement.nativeElement.value != this.editorCache;
    // TODO: REMOVER se a função de tabular não for implementada
    // if (e?.code === 'Tab') {
    //   this.tabular(e?.shiftKey);
    //   e.preventDefault();
    // }

    // Se o conteúdo do código-fonte foi alterado e não está no modo ao-vivo, é preciso limpar os erros
    // que podem estar osbsoletos na tela.
    // TODO: pensar numa forma melhor de fazer isso
    if (!this.analiseAoVivo && alterado) {
      this.resetErros();
      this.errorsService.limpar();
    }
    // Conta quantas linhas existem no código-fonte
    const count = this.editorElement.nativeElement.value.split('\n').length;
    // Ajusta a largura do campo de texto em si
    this.ajustaAltura(count);
    // Se faltam números de linhas, adiciona a diferença
    while (this.lineNumbers.length < count) {
      this.lineNumbers.push(this.lineNumbers.length);
    }
    // Se estão sobrando números de linhas, remove a diferença
    while (this.lineNumbers.length > count) {
      this.lineNumbers.pop();
    }
    // Chama a análise imediatamente caso o modo ao vivo esteja ativado
    if (this.analiseAoVivo && alterado) this.analisar();

    // Guarda o conteúdo do editor de texto para a próxima comparação
    this.editorCache = this.editorElement.nativeElement.value;
  }

  // TODO: REMOVER SE A FUNÇÃO DE TABULAR NÃO FOR IMPLEMENTADA
  // private tabular(shiftKey: boolean): void {
  //   const el = this.editorElement.nativeElement;
  //   const selectionStart = el.selectionStart;
  //   const linhas = el.value.substring(0, selectionStart).split('\n');
  //   console.log('tabulando...', linhas[linhas.length - 1]);
  //   if (!shiftKey)
  //     linhas[linhas.length - 1] = '    ' + linhas[linhas.length - 1];
  //   else {
  //     if (linhas[linhas.length - 1].substring(0, 4) === '    ')
  //       linhas[linhas.length - 1] = linhas[linhas.length - 1].substring(4);
  //   }

  //   const value = this.editorElement.nativeElement.value.split('\n');
  //   value[linhas.length - 1] = linhas[linhas.length - 1];
  //   this.editorElement.nativeElement.value = value.join('\n');
  //   this.editorElement.nativeElement.setSelectionRange(
  //     shiftKey ? selectionStart - 4 : selectionStart + 4,
  //     shiftKey ? selectionStart - 4 : selectionStart + 4
  //   );
  // }

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
