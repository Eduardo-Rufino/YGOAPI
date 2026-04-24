using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Integrations
{
    public interface ICardProvider
    {
        Task<YgoProDeckDto> ListCardByCollection(string colectionName);


    }
}
