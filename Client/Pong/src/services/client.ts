import { Injectable } from "@angular/core"
import { HubConnectionBuilder, HubConnection } from "@aspnet/signalr"
import { Observable } from "rxjs"
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable()
export class Client
{
    //private serverAddress: string = "https://localhost:44382/";
    private serverAddress: string = "/";
    private hubConnection: HubConnection;

    public isConnected: boolean = false;
    public myNickname: string = "";
    public opponentNickname: string = "";
    public didOpponentLeftTheGame: boolean = false;
    public didIWinLastGame: boolean = false;
    public amIInGame: boolean = false;

    constructor(private http: HttpClient, private router: Router) {
      this.hubConnection = new HubConnectionBuilder().withUrl(this.serverAddress + 'PongHub').build();
      this.registerMethodsAtHubConnection();
    }

    private registerMethodsAtHubConnection(): void {
      this.hubConnection.on("nicknameAlreadyExists", () => this.onNicknameAlreadyExists());
  }

    private onNicknameAlreadyExists()
    {
      this.myNickname = "";
      this.router.navigate(['/']);
    }

    public getHubConnection() : HubConnection {
      return this.hubConnection;
    }

    public checkIfNicknameAlreadyExists(nickname: string) : Observable<boolean>
    {
        return this.http.get<boolean>(this.serverAddress + "api/main/CheckIfNicknameAlreadyExists?nickname=" + nickname);
    }

    public getRandomNickname() : Observable<string>
    {
        return this.http.get<string>(this.serverAddress + "api/main/GetRandomNickname");
    }

    private onConnecitonStarted()
    {
      this.hubConnection.invoke("EnterGameroomAsync", this.myNickname).catch(err => console.error(err.toString()));
      this.isConnected = true;
      this.router.navigate(['/gameroom']);
    }

    public enterGameroom(myNickname: string) : void {
      this.myNickname = myNickname;

      this.hubConnection.start()
        .then(() => this.onConnecitonStarted())
        .catch(err => console.log('Error while establishing connection :('));
    }
}
