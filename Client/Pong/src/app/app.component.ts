import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  showWelcomeScreen: boolean = false;
  showGameroom: boolean = true;
  showGameWindow: boolean = false;

  ngOnInit() {

  }

  enterGameroom (nickname: string) : void {
    this.showWelcomeScreen = false;
    this.showGameroom = true;
  }
}
