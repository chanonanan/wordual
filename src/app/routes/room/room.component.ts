import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
  id!: string;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }

  start(): void {
    this.router.navigate(['/game', this.id]);
  }

}
