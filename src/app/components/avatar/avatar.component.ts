import { Component, Input } from '@angular/core';
import { getAvatar } from '@utils/avatar.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<img [src]="name" alt="avatar" class="avatar"/>`,
  styleUrls: ['./avatar.component.less']
})
export class AvatarComponent {
  get name(): any {
    return this._name;
  }

  @Input()
  set name(name: string | null) {
    this._name = getAvatar(name || 'Midnight');
  }

  private _name!: string;
}
