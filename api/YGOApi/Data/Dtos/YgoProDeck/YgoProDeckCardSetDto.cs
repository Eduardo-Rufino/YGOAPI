using System.Text.Json.Serialization;

namespace YGOApi.Data.Dtos.YgoProDeck;

public class YgoProDeckCardSetDtos
{
    public List<YgoProDeckCardSetDto> Collections { get; set; }
    public List<YgoProDeckCardSetDto> StarterDecks { get; set; }
}

public class YgoProDeckCardSetDto
{
    [JsonPropertyName("set_name")]
    public string SetName { get; set; }

    [JsonPropertyName("num_of_cards")]
    public int NumberOfCards { get; set; }

    [JsonPropertyName("tcg_date")]
    public DateTime ReleasedDate { get; set; }

    [JsonPropertyName("set_image")]
    public string SetImage { get; set; }

    public bool IsActive { get; set; }
}