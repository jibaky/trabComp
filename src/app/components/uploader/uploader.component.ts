import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilemanagerService } from 'src/app/services/filemanager/filemanager.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {

    constructor(private fileManagerService: FilemanagerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }
  inputChange(arquivo: File | null | undefined): void {
    if (arquivo == null || arquivo == undefined) return;
    this.fileManagerService.upload(arquivo).then((resultado) => {console.log("Funfou")}).catch((resultado) => { 
      let snackBarRef = this.snackBar.open(resultado,"okay", {
        duration: 5000
      });
    });
  }

}
