import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Compiladores';

  menu = [
    { name: 'Início', icon: 'home', link: '/' },
    { name: 'Calculadora', icon: 'calculate', link: '/calculator' },
    { name: 'Sobre', icon: 'info', link: '/sobre' },
  ];
}
