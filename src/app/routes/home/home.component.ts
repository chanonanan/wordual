import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { UserActions } from '@stores/user/user.action';
import { UserState } from '@stores/user/user.state';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, NgIf],
  template: `
    <section class="home-section">
      <h3>Wordual</h3>
      <section class="name-section section">
        <label for="name">Enter your name:</label>
        <input type="text" name="name" (keyup)="updateUsername($event)">
      </section>
      <section class="button-section section"*ngIf="{ isUsernameValid: isUsernameValid$ | async} as data" >
        <button (click)="createRoom()" *ngIf="!room; else joinRoomTemplate" [disabled]="!data.isUsernameValid">Create room</button>
        <ng-template #joinRoomTemplate>
          <button (click)="joinRoom()" [disabled]="!data.isUsernameValid">Join room</button>
        </ng-template>
      </section>
    </section>

  `,
  styleUrls: ['./home.component.less'],
  standalone: true
})
export class HomeComponent {
  @Input() room?: string;
  @Select(UserState.isUsernameValid) isUsernameValid$!: Observable<boolean>;

  private router = inject(Router);
  private store = inject(Store);

  createRoom(): void {
    this.router.navigate(['room', uuid()]);
  }

  joinRoom(): void {
    this.router.navigate(['room', this.room]);
  }

  updateUsername(event: Event): void {
    this.store.dispatch(new UserActions.SetUsername((event.target as HTMLInputElement).value));
  }
}
