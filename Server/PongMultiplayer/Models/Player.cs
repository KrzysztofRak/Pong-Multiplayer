namespace PongMultiplayer
{
    public class Player
    {
        public string ConnectionId { get; set; }
        public string Nickname { get; set; }
        public bool IsInGame { get; set; } = false;
        public string OpponentConnectionId { get; set; }
        public double PaddlePositionY { get; set; }
    }
}
