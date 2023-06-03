import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  template: `
    Room {{ id }}
    <div class="player-container">
    </div>
    <button (click)="start()">Start</button>
  `,
  styleUrls: ['./room.component.less'],
  standalone: true
})
export class RoomComponent implements OnInit {
  @Input() id?: string;
  private router = inject(Router);

  ngOnInit(): void {
    console.log(this.id)
  }

  start(): void {
    this.router.navigate(['/game', this.id]);
  }

}
