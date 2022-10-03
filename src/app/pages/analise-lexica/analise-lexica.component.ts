import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';

@Component({
  selector: 'app-analise-lexica',
  templateUrl: './analise-lexica.component.html',
  styleUrls: ['./analise-lexica.component.scss'],
})
export class AnaliseLexicaComponent implements OnInit {
  constructor(public analisadorLexico: AnalisadorLexicoService) {}

  ngOnInit(): void {}
}
