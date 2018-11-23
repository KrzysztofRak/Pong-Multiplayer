using Microsoft.AspNetCore.Mvc;
using PongMultiplayer.Repositories;

namespace PongMultiplayer.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MainController : ControllerBase
    {
        private IPlayerRepository playerRepo;

        public MainController(IPlayerRepository _playerRepo)
        {
            playerRepo = _playerRepo;
        }

        [HttpGet]
        public bool CheckIfNicknameAlreadyExists(string nickname)
        {
            return playerRepo.CheckIfNicknameAlreadyExistsAsync(nickname).Result;
        }

        [HttpGet]
        public JsonResult GetRandomNickname()
        {
            return new JsonResult(playerRepo.GetRandomNicknameAsync().Result);
        }
    }
}
