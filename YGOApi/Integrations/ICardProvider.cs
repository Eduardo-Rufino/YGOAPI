using YGOApi.Models;

namespace YGOApi.Integrations
{
    public interface ICardProvider
    {
        List<Card> ListCardByColection(string colectionName);


    }
}
