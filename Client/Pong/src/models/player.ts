export class Player {
    public connectionId: string;
    public nickname: string;
    public isChallengingMe: boolean = false;
    public isChallengedByMe: boolean = false;
    public isInGame: boolean = false;

    constructor(_connectionId: string, _nickname: string)
    {
      this.connectionId = _connectionId;
      this.nickname = _nickname;;    }
}
