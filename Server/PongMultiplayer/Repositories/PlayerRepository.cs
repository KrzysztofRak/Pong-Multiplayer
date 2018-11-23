using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PongMultiplayer.Repositories
{
    public class PlayerRepository : IPlayerRepository
    {
        private List<Player> players = new List<Player>();

        public async Task<Player> GetByConnectionIdAsync(string connectionId)
        {
            return players.Where(p => p.ConnectionId == connectionId).First();
        }

        public async Task<bool> CheckIfAnyOfPlayersHasLeftTheGameAsync(string p1ConnectionId, string p2ConnectionId)
        {
            return players.Where(p => p.ConnectionId == p1ConnectionId || p.ConnectionId == p2ConnectionId).Count() != 2;
        }

        public async Task<string> GetPlayerNicknameAsync(string playerConnectionId)
        {
            return (await GetByConnectionIdAsync(playerConnectionId)).Nickname;
        }

        public async Task AddAsync(string connectionId, string nickname)
        {
            players.Add(new Player() { ConnectionId = connectionId, Nickname = nickname });
        }

        public async Task<List<Player>> GetAllPlayersExceptAsync(string myConnectionId)
        {
            return players.Where(p => p.ConnectionId != myConnectionId).ToList();
        }

        public async Task RemoveAsync(string connectionId)
        {
            Player player = await GetByConnectionIdAsync(connectionId);
            if (player != null)
                players.Remove(player);
        }

        public async Task<bool> CheckIfNicknameAlreadyExistsAsync(string nickname)
        {
            return players.Where(p => p.Nickname == nickname).Any();
        }

        public async Task<string> GetRandomNicknameAsync()
        {
            Random rand = new Random(DateTime.Now.Millisecond);
            string nickname;
            do
            {
                nickname = "Player" + rand.Next(10000, 99999);
            } while (await CheckIfNicknameAlreadyExistsAsync(nickname));

            return nickname;
        }

    }
}
