import { Injectable } from '@angular/core';
import { IBaseMessage } from '@models/channel.model';
import { Realtime, Types } from 'ably';
import { Observable, from, map, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AblyService {

  private readonly baseAuthUrl: string = '/api/auth';
  private readonly roomListId: string = 'room-list-channel';
  private channel!: Types.RealtimeChannelCallbacks;
  private roomChannel!: Types.RealtimeChannelCallbacks;

  generateClient(clientId: string, roomId?: string): Observable<Realtime> {
    return this.connectServer(clientId).pipe(
      tap(ably => {
        if (roomId) {
          this.channel = ably.channels.get(roomId);
        }

        if (!this.roomChannel) {
          this.roomChannel = ably.channels.get(this.roomListId);
        }
      }),
    )
  }

  subscribe<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      this.channel.subscribe(eventName, (message: IBaseMessage<T>) => {
        observer.next(message.data);
      });
    });
  }

  subscribeRoom<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      this.roomChannel.subscribe(eventName, (message: IBaseMessage<T>) => {
        observer.next(message.data);
      });
    });
  }

  publish<T>(eventName: string, data: T): void {
    this.channel.publish(eventName, data);
  }

  publishRoom<T>(eventName: string, data: T): void {
    this.roomChannel.publish(eventName, data);
  }

  unsubscribe(): void {
    this.channel.unsubscribe();
    this.channel.detach();
  }

  private connectServer(clientId: string): Observable<Realtime> {
    const authUrl = new URL(`${this.baseAuthUrl}`, location.origin);
		authUrl.searchParams.append('clientId', clientId);
    const ably = new Realtime({ authUrl: authUrl.toString() });

    return from(ably.connection.once('connected')).pipe(
      map(() => {
        console.log('Connected to Ably!');
        return ably;
      }),
      shareReplay(1),
    );

  }
}
