using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Integrations
{
    public class YgoProDeckAdapter : ICardProvider
    {
        public async Task<YgoProDeckDto> ListCardByCollection(string colectionName)
        {
            var client = new HttpClient()
            {
                BaseAddress = new Uri("https://db.ygoprodeck.com/api/v7/cardinfo.php"),                
            };

            var response = await client.GetAsync($"?cardset={colectionName}");
            var cards = await response.Content.ReadFromJsonAsync<YgoProDeckDto>();
            foreach (var card in cards.Data) 
            {
                card.CardSet = colectionName;
            }

            return cards ?? new YgoProDeckDto();
        }
    }
}
