import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Erro, ErrorsService } from 'src/app/services/errors/errors.service';

@Component({
  selector: 'error-console',
  templateUrl: './error-console.component.html',
  styleUrls: ['./error-console.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ErrorConsoleComponent implements OnInit {
  displayedColumns: string[] = ['code', 'line', 'text'];
  columnsToDisplayWithExpand: string[] = [...this.displayedColumns, 'expand'];
  expandedElement: Erro | null;

  constructor(public errorsService: ErrorsService) {}

  ngOnInit(): void {}
}
