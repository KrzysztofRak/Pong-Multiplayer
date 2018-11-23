import { Injectable } from "@angular/core"
import { Client } from "./client";
import { HubConnection } from "@aspnet/signalr";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Router } from "@angular/router";
import { Ball } from "src/models/ball";

@Injectable()
export class GameClient {
  private hubConnection: HubConnection;

  public readonly boardWidth: number = 1000;
  public readonly boardHeight: number = 500;

  public readonly paddelWidth: number = 20;
  public readonly paddelHeight: number = 100;
  public readonly lineWidth: number = 6;
  public readonly lineHeight: number = 16;

  public readonly myPaddlePosX: number = 70;
  public readonly opponentPaddlePosX: number = 910;

  public myPaddlePosY: number;
  public opponentPaddlePosY: number;

  public ball: Ball;
  public myPoints: number;
  public opponentPoints: number;

  constructor(private client: Client, private router: Router) {
    this.hubConnection = client.getHubConnection();
    this.registerMethodsAtHubConnection();
    this.resetValuesToTheirDefaults();
  }

  public resetValuesToTheirDefaults(): void {
    this.ball = new Ball();
    this.myPaddlePosY = 200;
    this.opponentPaddlePosY = 200;

    this.ball.posX = this.boardWidth / 2 - this.ball.radius;
    this.ball.posY = this.boardHeight / 2 - this.ball.radius;
    this.ball.speedX = 4;
    this.ball.speedY = 4;

    this.myPoints = 0;
    this.opponentPoints = 0;
  }

  private registerMethodsAtHubConnection(): void {
    this.hubConnection.on("updateOpponentPaddlePositionY", (opponentPaddlePosY: number) => this.onUpdateOpponentPaddlePositionY(opponentPaddlePosY));
    this.hubConnection.on("updateBallState", (ballPosX: number, ballPosY: number, ballSpeedX: number, ballSpeedY: number) => this.onUpdateBallState(ballPosX, ballPosY, ballSpeedX, ballSpeedY));
    this.hubConnection.on("updatePoints", (myPoints: number, opponentPoints: number) => this.onUpdatePoints(myPoints, opponentPoints));
    this.hubConnection.on("finishGame", (didOpponentLeftTheGame: boolean) => this.onFinishGame(didOpponentLeftTheGame));
  }

  private onUpdateOpponentPaddlePositionY(opponentPaddlePosY: number): void {
    this.opponentPaddlePosY = opponentPaddlePosY;
  }

  private onUpdateBallState(ballPosX: number, ballPosY: number, ballSpeedX: number, ballSpeedY: number): void {
    this.ball.posX = ballPosX;
    this.ball.posY = ballPosY;
    this.ball.speedX = ballSpeedX;
    this.ball.speedY = ballSpeedY;
  }

  private onUpdatePoints(myPoints: number, opponentPoints: number): void {
    this.myPoints = myPoints;
    this.opponentPoints = opponentPoints;
  }

  private onFinishGame(didOpponentLeftTheGame: boolean): void {
    this.client.didOpponentLeftTheGame = didOpponentLeftTheGame;
    this.client.didIWinLastGame = (this.myPoints == 12);
    this.resetValuesToTheirDefaults();
    this.router.navigate(['/gameresult']);
  }

  public sendMyPaddlePositionY(): void {
    this.hubConnection.invoke("UpdatePaddlePositionYAsync", this.myPaddlePosY).catch(err => console.error(err.toString()))
  }
}
