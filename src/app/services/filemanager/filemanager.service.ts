import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilemanagerService {
  /**
   * Observer que emite os dados dos arquivos que forem carregados
   */
  public novoArquivo$ = new BehaviorSubject<string>("");
  constructor() {console.log 
    
    ("Hello mundito") 
  }
  /**
   * função responsável para subir um arquivo do tipo text/plain (txt) com as expressões
   * @param arq arquivo que vai ser uplodado
   * @returns não retorna nada (void)
   */
  upload(arq: File) :Promise<boolean> {
    console.log(arq);
    return new Promise((resolve, reject) => {
      if (arq.type != "text/plain"){
        reject(`O formato ${arq.type} não é suportado`);
        return
      }
      const reader = new FileReader();
      reader.onloadend = (event) => {
        console.log("Resultado: \n", reader.result);
        this.novoArquivo$.next(reader.result as string);
        resolve(true);
      };  
      reader.readAsText(arq);
    })
  }
}
