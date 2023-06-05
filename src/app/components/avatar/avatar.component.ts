import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { getAvatar } from '@utils/avatar.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgIf],
  template: `
    <img [src]="getImageSrc(name)" alt="avatar" class="avatar"/>
    <span *ngIf="displayName">{{ name }}</span>
  `,
  styleUrls: ['./avatar.component.less']
})
export class AvatarComponent {
  @Input() displayName: boolean = false;
  @Input() name!: string | null;

  getImageSrc(name: string | null): string {
    return getAvatar(name || 'Midnight');
  }
}
