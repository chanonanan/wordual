import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar *ngIf="router.url !== '/'"></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'worduel';
  public router = inject(Router);
}
