import { Injectable, inject } from '@angular/core';
import { CreateGameEventHandlerService } from '@services/event/handler/create-game.service';
import { FindGameEventHandlerService } from '@services/event/handler/find-game.service';
import { JoinGameEventHandlerService } from '@services/event/handler/join-game,service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly createGame = inject(CreateGameEventHandlerService);
  private readonly joinGame = inject(JoinGameEventHandlerService);
  private readonly findGame = inject(FindGameEventHandlerService);
}
