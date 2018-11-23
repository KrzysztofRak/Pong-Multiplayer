using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using PongMultiplayer.Repositories;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace PongMultiplayer
{
    [EnableCors("CorsPolicy")]
    public class PongHub : Hub
    {
        private IPlayerRepository playerRepo;

        public PongHub(IPlayerRepository _playerRepo)
        {
            playerRepo = _playerRepo;
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string playerConnectionId = Context.ConnectionId;
            await playerRepo.RemoveAsync(playerConnectionId);
            Clients.Others.SendAsync("removePlayer", playerConnectionId);
            base.OnDisconnectedAsync(exception);
        }

        public async Task SendChatMessageAsync(string message)
        {
            string playerConnectionId = Context.ConnectionId;
            string authorNickname = await playerRepo.GetPlayerNicknameAsync(playerConnectionId);
            Clients.Others.SendAsync("addChatMessage", authorNickname, message);
        }

        public async Task EnterGameroomAsync(string nickname)
        {
            string playerConnectionId = Context.ConnectionId;
            bool isNicknameAlreadyExists = await playerRepo.CheckIfNicknameAlreadyExistsAsync(nickname);

            if (isNicknameAlreadyExists)
            {
                await Clients.Caller.SendAsync("nicknameAlreadyExists");
                return;
            }

            await playerRepo.AddAsync(Context.ConnectionId, nickname);
            Clients.Others.SendAsync("addNewPlayer", playerConnectionId, nickname);
            Clients.Caller.SendAsync("addPlayersWhichAreAlreadyInGameroom", await playerRepo.GetAllPlayersExceptAsync(playerConnectionId));
        }

        public async Task SetChallengeStatusAgainstPlayerAsync(string challengedPlayerConnectionId, bool challengeStatus)
        {
            Clients.Client(challengedPlayerConnectionId).SendAsync("setPlayerChallengeStatusAgainstMe", Context.ConnectionId, challengeStatus);
        }

        public async Task SetChallengeStatusAgainstAllPlayersAsync(bool challengeStatus)
        {
            Clients.Others.SendAsync("setPlayerChallengeStatusAgainstMe", Context.ConnectionId, challengeStatus);
        }

        public async Task AcceptPlayerChallengeAsync(string playerConnectionId)
        {   
            Clients.Client(playerConnectionId).SendAsync("playerAcceptedMyChallenge", Context.ConnectionId);
        }

        public async Task SetOpponentConnectionIdAsync(string opponentConnectionId)
        {
            Player player = await playerRepo.GetByConnectionIdAsync(Context.ConnectionId);
            Player opponent = await playerRepo.GetByConnectionIdAsync(opponentConnectionId);
            player.OpponentConnectionId = opponent.ConnectionId;

            bool doesOpponentChallengeMe = (opponent.OpponentConnectionId == player.ConnectionId);
            if (doesOpponentChallengeMe)
                new Game(player.ConnectionId, opponent.ConnectionId);
        }

        public async Task SetPlayerGameStatusAsync(bool gameStatus)
        {
            string playerConnectionId = Context.ConnectionId;
            Player player = await playerRepo.GetByConnectionIdAsync(playerConnectionId);
            player.IsInGame = gameStatus;
            Clients.Others.SendAsync("setPlayerGameStatus", playerConnectionId, gameStatus);
        }

        public async Task UpdatePaddlePositionYAsync(double paddlePositionY)
        {
            Player player = await playerRepo.GetByConnectionIdAsync(Context.ConnectionId);
            player.PaddlePositionY = paddlePositionY;

            Clients.Client(player.OpponentConnectionId).SendAsync("updateOpponentPaddlePositionY",  paddlePositionY);
        }
    }
}
