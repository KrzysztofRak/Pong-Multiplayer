import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameClient } from 'src/services/game-client';
import { Client } from 'src/services/client';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})

export class GameComponent implements OnInit {

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private topCanvas: number;
  private lastMyPaddelPositionY: number;

  constructor(private gameClient: GameClient, public client: Client, private router: Router) {
    if(!client.amIInGame)
      this.router.navigate(['/gameroom']);

      setInterval(this.drawGameFrame.bind(this), 25);
      setInterval(this.tryToSendMyPaddelPositionY.bind(this), 25);
   }

  ngOnInit() {
    this.canvas = document.querySelector("canvas");
    this.canvas.width = this.gameClient.boardWidth;
    this.canvas.height = this.gameClient.boardHeight;
    this.topCanvas = this.canvas.offsetTop;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('mousemove', this.updateMyPaddelPositionY.bind(this));
  }

  public createArray(arrayLenght: number) : Array<number> {
    return new Array(arrayLenght);
  }

  private updateMyPaddelPositionY(e: MouseEvent): void {
    this.gameClient.myPaddlePosY = Number(e.clientY) - this.topCanvas - this.gameClient.paddelHeight / 2;

    if (this.gameClient.myPaddlePosY >= this.gameClient.boardHeight - this.gameClient.paddelHeight) {
      this.gameClient.myPaddlePosY = this.gameClient.boardHeight - this.gameClient.paddelHeight;
    }
    else if (this.gameClient.myPaddlePosY <= 0) {
      this.gameClient.myPaddlePosY = 0;
    }
  }

  private tryToSendMyPaddelPositionY() : void {
    if(this.lastMyPaddelPositionY != this.gameClient.myPaddlePosY)
    {
      this.gameClient.sendMyPaddlePositionY();
    }

    this.lastMyPaddelPositionY = this.gameClient.myPaddlePosY;
  }

  private drawTable(): void {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.gameClient.boardWidth, this.gameClient.boardHeight);

    this.ctx.fillStyle = 'gray';
    for (let linePosition = 20; linePosition < this.gameClient.boardHeight; linePosition += 30) {
      this.ctx.fillRect(this.gameClient.boardWidth / 2 - this.gameClient.lineWidth / 2, linePosition, this.gameClient.lineWidth, this.gameClient.lineHeight);
    }
  }

  private drawBall(): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(this.gameClient.ball.posX, this.gameClient.ball.posY, this.gameClient.ball.radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }

  private drawMyPaddle(): void {
    this.ctx.fillStyle = '#7FFF00';
    this.ctx.fillRect(this.gameClient.myPaddlePosX, this.gameClient.myPaddlePosY, this.gameClient.paddelWidth, this.gameClient.paddelHeight);
  }

  private drawOpponentPaddle(): void {
    this.ctx.fillStyle = 'yellow';
    this.ctx.fillRect(this.gameClient.opponentPaddlePosX, this.gameClient.opponentPaddlePosY, this.gameClient.paddelWidth, this.gameClient.paddelHeight);
  }

  private moveBall() : void
  {
    this.gameClient.ball.posX += this.gameClient.ball.speedX;
    this.gameClient.ball.posY += this.gameClient.ball.speedY;
  }

  private drawGameFrame(): void {
    this.drawTable();
    this.drawBall();
    this.drawMyPaddle();
    this.drawOpponentPaddle();
    this.moveBall();
  }
}
