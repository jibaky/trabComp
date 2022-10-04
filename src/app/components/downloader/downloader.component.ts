import { Component, Input, OnInit } from '@angular/core';
import { FilemanagerService } from 'src/app/services/filemanager/filemanager.service';


@Component({
  selector: 'app-downloader',
  templateUrl: './downloader.component.html',
  styleUrls: ['./downloader.component.scss']
})
export class DownloaderComponent implements OnInit {
  @Input('content') editorContent: string;
  constructor(
    private fileManagerService: FilemanagerService
  ) { }

  ngOnInit(): void {
  }
  download(): void{
    let file = this.fileManagerService.returnNewFile(this.editorContent);
    const link = document.createElement('a');
    const url = URL.createObjectURL(file)

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
  
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
