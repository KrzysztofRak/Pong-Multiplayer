import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from 'src/services/client';

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.less']
})
export class GameResultComponent implements OnInit {

  constructor(public client: Client, private router: Router) {
    if(client.opponentNickname == "")
      this.router.navigate(['/gameroom']);
  }

  ngOnInit() {
  }

  public returnToGameroom() : void {
    this.client.opponentNickname = "";
    this.router.navigate(['/gameroom']);
  }
}
