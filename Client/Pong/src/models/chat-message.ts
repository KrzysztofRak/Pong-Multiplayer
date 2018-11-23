export class ChatMessage {
    public authorNickname: string;
    public message: string;
    public date: string;
    public isMyMessage: boolean;
    public isWarningMessage: boolean;

    constructor(_authorNickname: string, _message: string, _isMyMessage: boolean, _isWarningMessage: boolean = false) {
        this.authorNickname = _authorNickname;
        this.message = _message;
        this.date = new Date().toLocaleString();
        this.isMyMessage = _isMyMessage;
        this.isWarningMessage = _isWarningMessage;
    }
}
