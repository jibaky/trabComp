import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }
  textExp: any = ''
  textProc: any = ''
  
  reNAT = /\d*/
  reREA = /\d*\.\d*/
  reAP = /\(/
  reFP = /\)/
  reOPSUM = /\+/
  reOPSUB = /\-/
  reOPMUL = /\*/
  reOPDIV = /\\/

  ngOnInit(): void {
  }
  func(text: any){
    let final = ''
    let words = text.split(' ')
    for(let i = 0; i<words.length; i++){
      if(this.reNAT.test(words[i])){
        final = final + words[i] + " => numero natural <br>"
      }
      else if(this.reREA.test(words[i])){
        final = final + words[i] + " => numero real <br>"
      }
      else if(this.reAP.test(words[i])){
        final = final + words[i] + " => abre parenteses <br>"
      }
      else if(this.reFP.test(words[i])){
        final = final + words[i] + " => fecha parenteses <br>"
      }
      else if(this.reOPSUM.test(words[i])){
        final = final + words[i] + " => operação soma <br>"
      }
      else if(this.reOPSUB.test(words[i])){
        final = final + words[i] + " => operação subtração <br>"
      }
      else if(this.reOPMUL.test(words[i])){
        final = final + words[i] + " => operação multiplicação <br>"
      }
      else if(this.reOPDIV.test(words[i])){
        final = final + words[i] + " => operação divisão <br>"
      } 
    }
    this.textProc = final
    return
  }
}
