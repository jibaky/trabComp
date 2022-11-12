import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { gramaticaRAFA } from 'src/app/gramatica/gramaticaRAFA';
import { AnalisadorGramaticalService } from 'src/app/services/analisador-gramatical/analisador-gramatical.service';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';

@Component({
  selector: 'app-analise-gramatical',
  templateUrl: './analise-gramatical.component.html',
  styleUrls: ['./analise-gramatical.component.scss'],
})
export class AnaliseGramaticalComponent implements OnInit {
  @ViewChild('tokensDrawer') drawerElement: MatDrawer;

  constructor(
    public analisadorLexico: AnalisadorLexicoService,
    private analisadorGramatical: AnalisadorGramaticalService
  ) {}

  ngOnInit(): void {
    const selectedGrammar = gramaticaRAFA;
    this.analisadorGramatical.selectGrammar(selectedGrammar);
  }

  ngAfterViewInit(): void {
    this.analisadorLexico.tokens$.subscribe((e) => {
      if (e.length === 0) {
        this.drawerElement.close();
      } else {
        this.analisadorGramatical.parse();
      }
    });
  }
}
