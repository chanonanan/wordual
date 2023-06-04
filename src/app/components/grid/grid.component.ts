import { AsyncPipe, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { EGridStatus, IGridData } from '@models/grid.model';
import { Select } from '@ngxs/store';
import { GameState } from '@stores/game/game.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, NgClass, UpperCasePipe],
  template: `
    <div class="grid-container" *ngIf="gridData | async as rows">
      <div class="row" *ngFor="let row of rows">
        <div class="key" *ngFor="let data of row"
          [ngClass]="getStatus(data.status)"
          >
          {{ data.letter | uppercase }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./grid.component.less']
})
export class GridComponent {
  @Select(GameState.gridData) public gridData!: Observable<IGridData[][]>;

  getStatus(status: EGridStatus): string {
    switch (status) {
      case EGridStatus.EMPTY:
        return '';
      case EGridStatus.NOT_IN_WORD:
        return 'not-found';
      case EGridStatus.WRONG_POSITION:
        return 'wrong';
      case EGridStatus.RIGHT_POSITION:
        return 'right';
    }
  }
}
