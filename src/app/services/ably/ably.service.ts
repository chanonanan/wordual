import { Injectable } from '@angular/core';
import { IBaseMessage } from '@models/channel.model';
import { Realtime, Types } from 'ably';
import { Observable, from, map, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AblyService {

  public channel!: Types.RealtimeChannelCallbacks;
  private readonly baseAuthUrl: string = '/api/auth';

  getChannel(clientId: string, roomId: string): Observable<Types.RealtimeChannelCallbacks> {
    return this.generateClient(clientId).pipe(
      map(ably => ably.channels.get(roomId)),
      tap(channel => this.channel = channel),
    )
  }

  subscribe<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      this.channel.subscribe(eventName, (message: IBaseMessage<T>) => {
        observer.next(message.data);
      });
    });
  }

  publish<T>(eventName: string, data: T): void {
    this.channel.publish(eventName, data);
  }

  private generateClient(clientId: string): Observable<Realtime> {
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
