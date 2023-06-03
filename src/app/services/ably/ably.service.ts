import { Injectable } from '@angular/core';
import { Realtime } from 'ably';

@Injectable({
  providedIn: 'root'
})
export class AblyService {

  private readonly baseAuthUrl: string = '/api/auth';
  private ably!: Realtime;

  generateClient(clientId: string): void {
    const authUrl = new URL(`${this.baseAuthUrl}`, location.origin);
		authUrl.searchParams.append('clientId', clientId);
    this.ably = new Realtime({ authUrl: authUrl.toString() });
  }

  getChannel(uuid: string) {
    return this.ably.channels.get(uuid);
  }
}
