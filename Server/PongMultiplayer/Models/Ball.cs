namespace PongMultiplayer.Models
{
    public class Ball
    {
        public int Radius { get; private set; } = 10;
        public double PosX { get; set; }
        public double PosY { get; set; }
        public double SpeedX { get; set; } = 4;
        public double SpeedY { get; set; } = 4;
    }
}
