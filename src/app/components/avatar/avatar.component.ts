import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { getAvatar } from '@utils/avatar.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <img [src]="getImageSrc(name)" alt="avatar" class="avatar" [ngClass]="size"/>
    <span *ngIf="displayName">{{ name }}</span>
  `,
  styleUrls: ['./avatar.component.less']
})
export class AvatarComponent {
  @Input() displayName: boolean = false;
  @Input() size: string = '';
  @Input() name!: string | null;

  getImageSrc(name: string | null): string {
    return getAvatar(name || 'Midnight');
  }
}
