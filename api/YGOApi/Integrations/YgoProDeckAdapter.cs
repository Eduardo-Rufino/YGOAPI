using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Data.Enums;

namespace YGOApi.Integrations;

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
            YgoProDeckCardSet? cardSet = card.CardSets.FirstOrDefault(x => x.SetName == colectionName);
            if (cardSet == null)
                continue;

            card.CardSet = cardSet.SetName;
            card.Rarity = SetRarity(cardSet.SetRarity);
        }

        return cards ?? new YgoProDeckDto();
    }

    private static CardRarity SetRarity(string rarity)
    {
        return rarity switch
        {
            string t when t.Equals("common", StringComparison.CurrentCultureIgnoreCase) => CardRarity.COMMON,
            string t when t.Equals("rare", StringComparison.CurrentCultureIgnoreCase) => CardRarity.RARE,
            string t when t.Equals("super rare", StringComparison.CurrentCultureIgnoreCase) => CardRarity.SUPER_RARE,
            string t when t.Equals("ultra rare", StringComparison.CurrentCultureIgnoreCase) => CardRarity.ULTRA_RARE,
            string t when t.Equals("secret rare", StringComparison.CurrentCultureIgnoreCase) => CardRarity.SECRET_RARE,
            _ => CardRarity.SECRET_RARE,
        };
    }
}