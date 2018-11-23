using System.Collections.Generic;
using System.Threading.Tasks;

namespace PongMultiplayer.Repositories
{
   public interface IPlayerRepository
    {
        Task<Player> GetByConnectionIdAsync(string connectionId);

        Task<bool> CheckIfAnyOfPlayersHasLeftTheGameAsync(string p1ConnectionId, string p2ConnectionId);

        Task<string> GetPlayerNicknameAsync(string playerConnectionId);

        Task AddAsync(string connectionId, string nickname);

        Task<List<Player>> GetAllPlayersExceptAsync(string myConnectionId);

        Task RemoveAsync(string connectionId);

        Task<bool> CheckIfNicknameAlreadyExistsAsync(string nickname);

        Task<string> GetRandomNicknameAsync();
    }
}
