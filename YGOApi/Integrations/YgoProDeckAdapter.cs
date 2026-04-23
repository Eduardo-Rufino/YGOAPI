using YGOApi.Models;

namespace YGOApi.Integrations
{
    public class YgoProDeckAdapter : ICardProvider
    {
        public List<Card> ListCardByColection(string colectionName)
        {
            return new List<Card>();
        }
    }
}
