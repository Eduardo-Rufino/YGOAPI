using AutoMapper.Configuration.Annotations;
using System.Text.Json.Serialization;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.YgoProDeck;

public class YgoProDeckDto
{
    public List<YgoProDeckCardDto> Data { get; set; }
}

public class YgoProDeckCardDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<string>? TypeLine { get; set; }
    public string Type { get; set; }
    public string Desc { get; set; }
    public string Race { get; set; }
    public int? Atk { get; set; }
    public int? Def { get; set; }
    public int? Level { get; set; }
    public string? Attribute { get; set; }
    public string? Archetype { get; set; }
    public int? Scale { get; set; }
    public int? LinkVal { get; set; }
    public List<string>? LinkMarkers { get; set; }

    [JsonPropertyName("card_images")]
    public List<YgoProDeckImageDto> CardImages { get; set; }

    [JsonPropertyName("card_sets")]
    public List<YgoProDeckCardSet> CardSets { get; set; }

    public string? CardSet { get; set; } = string.Empty;

    public CardRarity Rarity { get; set; }
}

public class YgoProDeckImageDto
{
    [JsonPropertyName("image_url")]
    public string ImageUrl { get; set; }

    [JsonPropertyName("image_url_small")]
    public string ImagelUrlSmall { get; set; }
}

public class YgoProDeckCardSet
{
    [JsonPropertyName("set_name")]
    public string SetName { get; set; }

    [JsonPropertyName("set_rarity")]
    public string SetRarity { get; set; }
}