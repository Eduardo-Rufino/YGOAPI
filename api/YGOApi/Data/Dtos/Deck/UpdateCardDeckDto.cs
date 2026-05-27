using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Deck
{
    public sealed record UpdateCardDeckDto(int CardId, CardLocation Location, int Quantity = 1);
    
}
