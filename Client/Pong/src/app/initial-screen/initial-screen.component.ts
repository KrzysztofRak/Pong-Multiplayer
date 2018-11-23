import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Client } from 'src/services/client';

@Component({
  selector: 'app-initial-screen',
  templateUrl: './initial-screen.component.html',
  styleUrls: ['./initial-screen.component.less']
})
export class InitialcreenComponent implements OnInit {

  @Output()
  public eventEnterGameroom = new EventEmitter<string>();
  public myNickname: string = "";
  public isBtnDisabled: boolean = true;

  @ViewChild('wrongNicknamePopover')
  wrongNicknamePopover: ElementRef;

  constructor(private client: Client) {
  }

  ngOnInit() {
    this.client.getRandomNickname().subscribe(nickname => {
      this.myNickname = nickname;
      this.onNicknameChange();
    });
  }

  public onNicknameChange() : void {
    this.isBtnDisabled = (this.myNickname.length < 3);
  }

  public tryToEnterToGameroom(): void {
    this.client.checkIfNicknameAlreadyExists(this.myNickname).subscribe(isNicknameAlreadyExists => {
      if (isNicknameAlreadyExists)
        this.wrongNicknamePopover.nativeElement.open();
      else
        this.client.enterGameroom(this.myNickname);
    });
  }
}
