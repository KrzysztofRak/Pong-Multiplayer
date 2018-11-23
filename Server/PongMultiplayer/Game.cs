using Microsoft.AspNetCore.SignalR;
using PongMultiplayer.Models;
using PongMultiplayer.Repositories;
using System;
using System.Threading.Tasks;

namespace PongMultiplayer
{
    public class Game
    {
        private readonly PongHub pongHub;
        private readonly IPlayerRepository playerRepo;
        private readonly Player p1, p2;
        private readonly string p1_ConnectionId, p2_ConnectionId;
        
        private const int P1_PaddlePosX = 70;
        private const int P2_PaddlePosX = 910;
        private const int PaddleWidth = 20;
        private const int PaddleHeight = 100;
        private const int PaddleDistanceFromVerticalLine = 70;
        private const int BoardWidth = 1000;
        private const int BoardHeight = 500;
        private const int FrameMsDelay = 25;

        private int p1_Points = 0, p2_Points = 0;
        private Ball ball = new Ball();

        private enum CollisionType { PaddleLine, HorizontalLine };
        private CollisionType nextCollisionType = CollisionType.HorizontalLine;

        public Game(string _p1ConnectionId, string _p2ConnectionId)
        {
            p1_ConnectionId = _p1ConnectionId;
            p2_ConnectionId = _p2ConnectionId;

            pongHub = (PongHub)Startup._ServiceProvider.GetService(typeof(PongHub));
            playerRepo = (IPlayerRepository)Startup._ServiceProvider.GetService(typeof(IPlayerRepository));
            p1 = playerRepo.GetByConnectionIdAsync(p1_ConnectionId).Result;
            p2 = playerRepo.GetByConnectionIdAsync(p2_ConnectionId).Result;

            StartGameAsync();
        }

        /// <summary>
        /// Main game loop: Calculate time left to next collision point -> Calculate ball state on collision point -> Send ball state to clients.
        /// </summary>
        private async Task StartGameAsync()
        {
            await InitializeGame();

            while (!await IsGameFinishedAsync())
            {
                int framesLeftToNextCollisionPoint = await GetFramesLeftToNextCollisionPoint();
                int msTimeLeftToNextCollisionPoint = framesLeftToNextCollisionPoint * FrameMsDelay;
                await Task.Delay(msTimeLeftToNextCollisionPoint);
                await MoveBallToCollisionPoint(framesLeftToNextCollisionPoint);
                await CalculateBallStateOnCollisionPoint(framesLeftToNextCollisionPoint);
                SendBallStateAsync();
            }

            await FinishGame();
        }

        /// <summary>
        /// Informs clients that the game has started and sends them the initial ball state.
        /// </summary>
        private async Task InitializeGame()
        {
            await pongHub.Clients.Clients(p1_ConnectionId, p2_ConnectionId).SendAsync("startGame");
            await SendPointsAsync();
            await ResetBallStateAsync(-1);
            SendBallStateAsync();
        }

        /// <summary>
        /// Checks if any of players has won or left the game.
        /// </summary>
        private async Task<bool> IsGameFinishedAsync()
        {
            if (await playerRepo.CheckIfAnyOfPlayersHasLeftTheGameAsync(p1_ConnectionId, p2_ConnectionId))
                return true;

            return (p1_Points == 12 || p2_Points == 12);
        }

        /// <summary>
        /// Informs clients about that the game has ended and if is it because of player which left the game.
        /// </summary>
        private async Task FinishGame()
        {
            bool didAnyOfPlayersLeftTheGame = await playerRepo.CheckIfAnyOfPlayersHasLeftTheGameAsync(p1_ConnectionId, p2_ConnectionId);
            await pongHub.Clients.Clients(p1_ConnectionId, p2_ConnectionId).SendAsync("finishGame", didAnyOfPlayersLeftTheGame);
            await ResetPlayersPropertiesAsync();
        }

        /// <summary>
        /// Sets EnemyConnectionId and PaddlePositionY of players to its initial values.
        /// </summary>
        private async Task ResetPlayersPropertiesAsync()
        {
            p1.OpponentConnectionId = "";
            p1.PaddlePositionY = 200;
            p2.OpponentConnectionId = "";
            p2.PaddlePositionY = 200;
        }

        /// <summary>
        /// Calculates number of frames left to collision occurs and determines what type of collision is going to be next.
        /// </summary>
        private async Task<int> GetFramesLeftToNextCollisionPoint()
        {
            double framesLeftToCollisionWithPaddleLine, framesLeftToCollisionWithHorizontalLine;

            if (ball.SpeedX < 0)
                framesLeftToCollisionWithPaddleLine = ((ball.PosX - ball.Radius) - (P1_PaddlePosX + PaddleWidth)) / (-ball.SpeedX);
            else
                framesLeftToCollisionWithPaddleLine = (P2_PaddlePosX - (ball.PosX + ball.Radius)) / ball.SpeedX;

            if (ball.SpeedY < 0)
                framesLeftToCollisionWithHorizontalLine = (ball.PosY - ball.Radius) / (-ball.SpeedY);
            else
                framesLeftToCollisionWithHorizontalLine = (BoardHeight - (ball.PosY + ball.Radius)) / ball.SpeedY;

            if (framesLeftToCollisionWithPaddleLine < framesLeftToCollisionWithHorizontalLine)
            {
                nextCollisionType = CollisionType.PaddleLine;
                return (int)framesLeftToCollisionWithPaddleLine;
            }
            else
            {
                nextCollisionType = CollisionType.HorizontalLine;
                return (int)framesLeftToCollisionWithHorizontalLine;
            }
        }

        /// <summary>
        /// Updates ball position to collision point.
        /// </summary>
        private async Task MoveBallToCollisionPoint(int framesLeftToNextCollision)
        {
            ball.PosX += framesLeftToNextCollision * ball.SpeedX;
            ball.PosY += framesLeftToNextCollision * ball.SpeedY;
        }

        /// <summary>
        /// Checks what type of collision occurrs at collision point and updates ball state.
        /// </summary>
        private async Task CalculateBallStateOnCollisionPoint(int framesLeftToNextCollision)
        {
            if (nextCollisionType == CollisionType.HorizontalLine) // When the ball hit one of the horizontal lines
            {
                ball.SpeedY = -ball.SpeedY;
                await SpeedUpBallAsync();
            }
            else if (nextCollisionType == CollisionType.PaddleLine && await CheckIfBallHitOneOfThePaddlesAsync()) // When the ball is on paddle Y axis and it actually hit the paddle
            {
                ball.SpeedX = -ball.SpeedX;
                await SpeedUpBallAsync();
            }
            else // When the ball is on paddle Y axis but it miss the paddle so it's going to hit the vertical line
            {
                await WaitForBallToHitTheVerticalLine();
                await UpdatePoints();
                SendPointsAsync();              
            }
        }

        /// <summary>
        /// Determines if the ball has hit any of the paddles in this moment.
        /// </summary>
        private async Task<bool> CheckIfBallHitOneOfThePaddlesAsync()
        {
            return ((ball.PosY - ball.Radius < p1.PaddlePositionY + PaddleHeight && ball.PosY + ball.Radius > p1.PaddlePositionY)
                    || (ball.PosY - ball.Radius < p2.PaddlePositionY + PaddleHeight && ball.PosY + ball.Radius > p2.PaddlePositionY));
        }

        /// <summary>
        /// Speed up ball when it hit one of the horizontal lines or one of the paddles.
        /// </summary>
        private async Task SpeedUpBallAsync()
        {
            if (ball.SpeedX > 0 && ball.SpeedX < 16)
                ball.SpeedX += .5;
            else if (ball.SpeedX < 0 && ball.SpeedX > -16)
                ball.SpeedX -= .5;

            if (ball.SpeedY > 0 && ball.SpeedY < 16)
                ball.SpeedY += .25;
            else if (ball.SpeedY < 0 && ball.SpeedY > -16)
                ball.SpeedY -= .25;
        }

        /// <summary>
        /// Waits for ball to hit the vertical line when player miss it.
        /// </summary>
        private async Task WaitForBallToHitTheVerticalLine()
        {
            await Task.Delay((int)((PaddleDistanceFromVerticalLine + PaddleWidth) / Math.Abs(ball.SpeedX)) * FrameMsDelay);
        }

        /// <summary>
        /// Sets ball position back to the center of the board and initializes its speed with a default value in a specific direction.
        /// </summary>
        private async Task ResetBallStateAsync(int direction)
        {
            ball.SpeedX = 4 * direction;
            ball.SpeedY = 4;
            ball.PosX = BoardWidth / 2;
            ball.PosY = BoardHeight / 2;
        }

        /// <summary>
        /// Determines which player has scored a point.
        /// </summary>
        private async Task UpdatePoints()
        {
            if (ball.SpeedX < 0)
            {
                p2_Points++;
                await ResetBallStateAsync(-1);
            }
            else
            {
                p1_Points++;
                await ResetBallStateAsync(1);
            }
        }

        /// <summary>
        /// Sends actual points numbers to players
        /// </summary>
        private async Task SendPointsAsync()
        {
            pongHub.Clients.Client(p1_ConnectionId).SendAsync("updatePoints", p1_Points, p2_Points);
            pongHub.Clients.Client(p2_ConnectionId).SendAsync("updatePoints", p2_Points, p1_Points);
        }

        /// <summary>
        /// Sends current ball position and speed to players
        /// </summary>
        private async Task SendBallStateAsync()
        {
            pongHub.Clients.Client(p1_ConnectionId).SendAsync("updateBallState", ball.PosX, ball.PosY, ball.SpeedX, ball.SpeedY);
            pongHub.Clients.Client(p2_ConnectionId).SendAsync("updateBallState", (BoardWidth - ball.PosX), ball.PosY, -ball.SpeedX, ball.SpeedY);
        }
    }
}
