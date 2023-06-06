import { Injectable } from '@angular/core';
import { Observable, delay, first, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  showToast(message: string, type: 'error' | 'success'): void {
    this.createToast(message, type).pipe(
      tap(toast => document.body.appendChild(toast)),
      delay(100),
      tap(toast => toast.classList.add('show')),
      delay(3000),
      tap(toast => toast.classList.remove('show')),
      delay(1000), // wait for animation done
      tap(toast => document.body.removeChild(toast)),
      first(),
    ).subscribe();

  }

  private createToast(message: string, type: 'error' | 'success'): Observable<HTMLDivElement> {
    const toastElement = document.createElement('div');
    toastElement.className = `toast-message ${type}`;
    toastElement.innerText = message;
    return of(toastElement);
  }
}
