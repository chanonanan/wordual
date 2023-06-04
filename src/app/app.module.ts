import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from "@components/navbar/navbar.component";
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { GameState } from '@stores/game/game.state';
import { RoomState } from '@stores/room/room.state';
import { UserState } from '@stores/user/user.state';
import { WordState } from '@stores/word/word.state';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        NgxsModule.forRoot([GameState, UserState, WordState, RoomState], {
            developmentMode: false
        }),
        NgxsLoggerPluginModule.forRoot(),
        NavbarComponent
    ]
})
export class AppModule { }
