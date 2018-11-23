import { Injectable, PlatformRef } from "@angular/core"
import { HubConnection } from "@aspnet/signalr"
import { BehaviorSubject, Observable } from "rxjs"
import { ChatMessage } from "src/models/chat-message";
import { Client } from "./client";

@Injectable()
export class ChatClient {
    private hubConnection: HubConnection;

    private chatMessages: Array<ChatMessage> = [];
    private chatMessagesObs = new BehaviorSubject<Array<ChatMessage>>(this.chatMessages);

    constructor(private client: Client) {
        this.hubConnection = client.getHubConnection();
        this.registerMethodsAtHubConnection();
    }

    private registerMethodsAtHubConnection(): void {
        this.hubConnection.on("addChatMessage", (authorNickname: string, message: string) => this.onAddChatMessage(authorNickname, message))
    }

    private onAddChatMessage(authorNickname: string, message: string, isMyMessage: boolean = false): void {
        this.chatMessages.push(new ChatMessage(authorNickname, message, isMyMessage));
        this.chatMessagesObs.next(this.chatMessages);
    }

    public getChatMessages(): Observable<Array<ChatMessage>> {
        return this.chatMessagesObs.asObservable();
    }

    public sendChatMessage(message: string): void {
        this.hubConnection.invoke("SendChatMessageAsync", message).catch(err => console.error(err.toString()))
        this.onAddChatMessage(this.client.myNickname, message, true)
    }

    public sendWarningMessage(message: string): void {
        this.chatMessages.push(new ChatMessage("Serwer", message, false, true));
        this.chatMessagesObs.next(this.chatMessages);
    }
}
