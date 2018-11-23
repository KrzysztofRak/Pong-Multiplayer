import { Injectable } from "@angular/core"
import { HubConnectionBuilder, HubConnection } from "@aspnet/signalr"
import { BehaviorSubject, Observable } from "rxjs"
import { Player } from "../models/player"
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Client } from "./client";

@Injectable()
export class GameroomClient {
  private hubConnection: HubConnection;

  public players: Array<Player> = [];
  public playersObs = new BehaviorSubject<Array<Player>>(this.players);

  public amIChallengingAllPlayers: boolean = false;

  constructor(private client: Client, private router: Router) {
    this.hubConnection = client.getHubConnection();
    this.registerMethodsAtHubConnection();
  }

  private registerMethodsAtHubConnection(): void {
    this.hubConnection.on("addNewPlayer", (playerConnectionId: string, playerNickname: string) => this.onAddNewPlayer(playerConnectionId, playerNickname));
    this.hubConnection.on("removePlayer", (playerConnectionId: string) => this.onRemovePlayer(playerConnectionId));
    this.hubConnection.on("addPlayersWhichAreAlreadyInGameroom", (players: Array<Player>) => this.onAddPlayersWhichAreAlreadyInGameroom(players));
    this.hubConnection.on("setPlayerChallengeStatusAgainstMe", (playerConnectionId: string, challengeStatus: boolean) => this.onSetPlayerChallengeStatusAgainstMe(playerConnectionId, challengeStatus));
    this.hubConnection.on("playerAcceptedMyChallenge", (playerConnectionId: string) => this.onPlayerAcceptedMyChallenge(playerConnectionId));
    this.hubConnection.on("setPlayerGameStatus", (playerConnectionId: string, isPlayerInGame: boolean) => this.onSetPlayerGameStatus(playerConnectionId, isPlayerInGame));
    this.hubConnection.on("startGame", () => this.onStartGame());
  }

  private onAddNewPlayer(playerConnectionId: string, playerNickname: string): void {
    let newPlayer: Player = new Player(playerConnectionId, playerNickname);
    newPlayer.isChallengedByMe = this.amIChallengingAllPlayers;
    this.players.push(newPlayer);
    this.playersObs.next(this.players);
  }

  private onRemovePlayer(playerConnectionId: string): void {
    this.players = this.players.filter(p => p.connectionId != playerConnectionId);
    this.playersObs.next(this.players);
  }

  private onAddPlayersWhichAreAlreadyInGameroom(players: Array<Player>): void {
    this.players = this.players.concat(players);
    this.playersObs.next(this.players);
  }

  private onSetPlayerChallengeStatusAgainstMe(playerConnectionId: string, challengeStatus: boolean): void {
    let player: Player = this.players.find(p => p.connectionId === playerConnectionId)
    player.isChallengingMe = challengeStatus;
  }

  private onPlayerAcceptedMyChallenge(playerConnectionId: string): void {
    let player: Player = this.players.find(p => p.connectionId === playerConnectionId)
    if (player.isChallengedByMe) {
      this.client.opponentNickname = player.nickname;
      this.hubConnection.invoke("SetOpponentConnectionIdAsync", player.connectionId).catch(err => console.error(err.toString()));
    }
  }

  private onSetPlayerGameStatus(playerConnectionId: string, isPlayerInGame: boolean): void {
    let player: Player = this.players.find(p => p.connectionId === playerConnectionId)
    player.isInGame = isPlayerInGame;
  }

  private onStartGame(): void {
    if (!this.client.amIInGame)
      this.enterGame();
  }

  private acceptPlayerChallenge(player: Player): void {
    this.client.opponentNickname = player.nickname;
    this.hubConnection.invoke("AcceptPlayerChallengeAsync", player.connectionId).catch(err => console.error(err.toString()));
    this.hubConnection.invoke("SetOpponentConnectionIdAsync", player.connectionId).catch(err => console.error(err.toString()));
  }

  private enterGame(): void {
    this.setMyChallangeStatusAgainstAllPlayers(false);
    this.setMyGameStatus(true);
    this.router.navigate(['/game']);
  }

  public setMyGameStatus(gameStatus: boolean) {
    this.client.amIInGame = gameStatus;
    this.hubConnection.invoke("SetPlayerGameStatusAsync", gameStatus).catch(err => console.error(err.toString()))
  }

  public setMyChallengeStatusAgainstPlayer(playerConnectionId: string, challengeStatus: boolean): void {
    let player: Player = this.players.find(p => p.connectionId === playerConnectionId)
    player.isChallengedByMe = challengeStatus;

    if (!player.isChallengingMe)
      this.hubConnection.invoke("SetChallengeStatusAgainstPlayerAsync", playerConnectionId, challengeStatus).catch(err => console.error(err.toString()))
    else
      this.acceptPlayerChallenge(player);
  }

  public setMyChallangeStatusAgainstAllPlayers(challengeStatus: boolean): void {
    this.amIChallengingAllPlayers = challengeStatus;
    this.hubConnection.invoke("SetChallengeStatusAgainstAllPlayersAsync", challengeStatus).catch(err => console.error(err.toString()))

      this.players.forEach(p => {
        p.isChallengedByMe = challengeStatus;
        if (this.amIChallengingAllPlayers && p.isChallengingMe) {
          this.acceptPlayerChallenge(p);
          return;
        }
      })
  }

  public getPlayers(): Observable<Array<Player>> {
    return this.playersObs.asObservable();
  }
}
