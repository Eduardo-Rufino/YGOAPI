using YGOApi.Data.Dtos.YgoProDeck;

namespace YGOApi.Integrations;

public interface ICardProvider
{
    Task<YgoProDeckDto> ListCardByCollection(string colectionName);
}