import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { AnalisadorLexicoService } from 'src/app/services/analisador-lexico/analisador-lexico.service';

@Component({
  selector: 'app-analise-lexica',
  templateUrl: './analise-lexica.component.html',
  styleUrls: ['./analise-lexica.component.scss'],
})
export class AnaliseLexicaComponent implements OnInit {
  constructor(public analisadorLexico: AnalisadorLexicoService) {}
  @ViewChild('tokensDrawer') drawerElement: MatDrawer;

  ngOnInit(): void {}
  
  ngAfterViewInit(): void{
    this.analisadorLexico.tokens$.subscribe(e=>{
      if(e.length === 0){
        this.drawerElement.close()
      }
    })
  }
}
