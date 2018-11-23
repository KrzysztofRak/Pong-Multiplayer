import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from 'src/services/client';
import { GameroomClient } from 'src/services/gameroom-client';
import { ChatClient } from 'src/services/chat-client';
import { Player } from 'src/models/player';


@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.less']
})

export class GameroomComponent implements OnInit {
  public players: Array<Player> = [];

  constructor(private gameroomClient: GameroomClient, private chatClient: ChatClient, public client: Client, private router: Router) {
    if (client.myNickname == "")
      this.router.navigate(['/']);

      this.waitUntilConnectionStarted();
      gameroomClient.setMyGameStatus(false);
      gameroomClient.getPlayers().subscribe((players: Array<Player>) => {
        this.players = players;
    });
  }

  ngOnInit() {

  }

  private waitUntilConnectionStarted() : void
  {
    while(!this.client.isConnected)
    {
    }
  }

  public toggleChallengeStatusAgainstPlayer(playerConnectionId: string, isChallengedByMe: boolean): void {
    this.gameroomClient.setMyChallengeStatusAgainstPlayer(playerConnectionId, !isChallengedByMe);
  }

  private isAnyPlayerChallengingMe() : boolean
  {
    return this.gameroomClient.players.some(p => p.isChallengingMe == true);
  }

  public toggleChallengeStatusAgainstAllPlayers(event: Event): void {
    if(!this.gameroomClient.amIChallengingAllPlayers && this.isAnyPlayerChallengingMe())
    {
      this.chatClient.sendWarningMessage("Nie możesz rzucić wyzwania wszystkim graczom, ponieważ istnieje gracz który już Cię wyzwał.");
      return;
    }

    let btn: Element = event.srcElement;
    this.gameroomClient.amIChallengingAllPlayers = !this.gameroomClient.amIChallengingAllPlayers;

    btn.textContent = this.gameroomClient.amIChallengingAllPlayers ? "Cofnij wyzwanie wobec wszystkich graczy" : "Rzuć wyzwanie wszystkim graczom";
    btn.className = this.gameroomClient.amIChallengingAllPlayers ? btn.className.replace('btn-primary', 'btn-warning') : btn.className.replace('btn-warning', 'btn-primary');
    this.gameroomClient.setMyChallangeStatusAgainstAllPlayers(this.gameroomClient.amIChallengingAllPlayers);
  }
}
