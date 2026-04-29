using YGOApi.Models;

namespace YGOApi.Data.Dtos.Deck
{
    public class ReadDeckCardDto
    {
        public int CardId { get; set; }
        public string DeckName { get; set; }
        public string CardName { get; set; }
        public int? Attack { get; set; }
        public int? Defense { get; set; }
        public string ImageUrl { get; set; }
        public int Quantity { get; set; }
    }
}
