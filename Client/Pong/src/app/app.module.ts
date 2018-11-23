import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChatComponent } from './gameroom/chat/chat.component';
import { GameComponent } from './game/game.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { InitialcreenComponent } from './initial-screen/initial-screen.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Client } from 'src/services/client';
import { GameClient } from 'src/services/game-client';
import { GameroomClient } from 'src/services/gameroom-client';
import { ChatClient } from '../services/chat-client';
import { GameResultComponent } from './game-result/game-result.component';

const appRoutes: Routes = [
  { path: '', component: InitialcreenComponent },
  { path: 'gameroom', component: GameroomComponent },
  { path: 'game', component: GameComponent },
  { path: 'gameresult', component: GameResultComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    GameComponent,
    GameroomComponent,
    InitialcreenComponent,
    GameResultComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    HttpClientModule,
    NgbModule
  ],
  providers: [Client, GameroomClient, GameClient, ChatClient],
  bootstrap: [AppComponent]
})

export class AppModule { }
