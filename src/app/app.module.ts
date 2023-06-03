import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NavbarComponent } from "@components/navbar/navbar.component";
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { GameState } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';
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
        NgxsModule.forRoot([GameState, UserState], {
            developmentMode: false
        }),
        NgxsLoggerPluginModule.forRoot(),
        NavbarComponent
    ]
})
export class AppModule { }
