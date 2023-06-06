import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { delay, filter } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop" *ngIf="showOverlay">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
  `,
  styleUrls: ['./loading.component.less']
})
export class LoadingComponent implements OnInit {

  public showOverlay: boolean = true;
  private router = inject(Router);
  private actions = inject(Actions);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
      takeUntilDestroyed(this.destroyRef),
      delay(700)
    ).subscribe(() => {
      console.log('hide');
      this.showOverlay = false;
    });

    this.actions.pipe(ofActionDispatched(GameActions.CreateGame, GameActions.FindGame, GameActions.JoinGame, GameActions.StartGame)).subscribe(() => {
      console.log('CreateGame');
      this.showOverlay = true;
    })

    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => {
      console.log('NavigationStart');
      this.showOverlay = true;
    })

  }

}
