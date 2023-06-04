import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { first, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastElement: HTMLDivElement | null = null;
  private toastQueue: { message: string, type: string }[] = [];
  private isToastShowing = false;

  showToast(message: string, type: 'error' | 'success'): void {
    const toast = { message, type };
    this.toastQueue.push(toast);

    if (!this.isToastShowing) {
      this.showNextToast();
    }
  }

  private showNextToast(): void {
    if (this.toastQueue.length === 0) {
      return;
    }

    const toast = this.toastQueue.shift()!;
    this.createToastElement(toast.message, toast.type);

    timer(100).pipe(first()).subscribe(() => {
      this.showToastElement();

      timer(3000).pipe(take(1)).subscribe(() => {
        this.hideToastElement();
        timer(600).pipe(take(1)).subscribe(() => {
          document.body.removeChild(this.toastElement!);
          this.toastElement = null;
          this.showNextToast();
        });
      });
    });

  }

  private createToastElement(message: string, type: string): void {
    if (!this.toastElement) {
      this.toastElement = document.createElement('div');
      document.body.appendChild(this.toastElement);
    }
    this.toastElement.innerText = message;
    this.toastElement.className = `toast-message ${type}`;
  }

  private showToastElement(): void {
    this.toastElement!.classList.add('show');
    this.isToastShowing = true;
  }

  private hideToastElement(): void {
    this.toastElement!.classList.remove('show');
    this.isToastShowing = false;
  }
}
