import { Component, inject } from '@angular/core';
import { EventService } from '@services/event/event.service';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  private readonly evetService = inject(EventService);
}
