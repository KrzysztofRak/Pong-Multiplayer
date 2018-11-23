import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChatClient } from '../../../services/chat-client';
import { ChatMessage } from 'src/models/chat-message';
import { R3_CHANGE_DETECTOR_REF_FACTORY__PRE_NGCC__ } from '@angular/core/src/ivy_switch/runtime/legacy';
import { Client } from '../../../services/client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
  @ViewChild('messageInputRef')
  messageInputRef: ElementRef;

  public chatMessages: Array<ChatMessage> = [];

  constructor(private chatClient: ChatClient, private client: Client) {
    chatClient.getChatMessages().subscribe((chatMessages: Array<ChatMessage>) => {
        this.chatMessages = chatMessages;
    });
  }

  ngOnInit() {
  }

  public sendChatMessage()
  {
    let message: string = this.messageInputRef.nativeElement.value;
    if(message == "")
      return;

    this.messageInputRef.nativeElement.value = "";
    this.chatClient.sendChatMessage(message);
  }

}
