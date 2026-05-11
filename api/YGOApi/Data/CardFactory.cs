using YGOApi.Models;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Data.Enums;

namespace YGOApi.Data;

public class CardFactory
{
    public static Card CreateCardFromYgoProDeckDto(YgoProDeckCardDto dto)
    {
        return new Card
        {
            Name = dto.Name,
            Archetype = dto.Archetype,
            Attack = dto.Atk,
            Defense = dto.Def,
            Effect = dto.Desc,
            Type = MapDtoTypeToCardType(dto.Type),
            SubType = MapDtoTypeAndRaceToSubType(dto.Type, dto.Race),
            Attribute = Enum.TryParse<CardAtribute>(dto.Attribute, true, out var attribute) ? attribute : null,
            Level = dto.Level,
            Race = dto.Type.Contains("monster", StringComparison.CurrentCultureIgnoreCase) ? MapDtoRaceToCardRace(dto.Race) : null,
            Collection = dto.CardSet ?? string.Empty,
            PendulumScale = dto.Scale,
            LinkRating = dto.LinkVal,
            LinkMarkers = dto.LinkMarkers != null ? string.Join(",", dto.LinkMarkers) : null,
            ImageUrl = dto.CardImages[0].ImageUrl,
            ImageUrlSmall = dto.CardImages[0].ImagelUrlSmall,
            Passcode = dto.Id,
            Rarity = dto.Rarity,
            Quantity = SetInitialQuantity(dto.Rarity)
        };
    }

    private static int SetInitialQuantity(CardRarity rarity)
    {
        return rarity switch
        {
            CardRarity.COMMON => 16,
            CardRarity.RARE => 12,
            CardRarity.SUPER_RARE => 8,
            CardRarity.ULTRA_RARE => 6,
            CardRarity.SECRET_RARE => 4,
            _ => 4,
        };
    }

    private static CardType MapDtoTypeToCardType(string dtoType)
    {
        if (dtoType.Contains("monster", StringComparison.CurrentCultureIgnoreCase))
            return CardType.MONSTER;
        if (dtoType.Contains("spell", StringComparison.CurrentCultureIgnoreCase))
            return CardType.SPELL;
        if (dtoType.Contains("trap", StringComparison.CurrentCultureIgnoreCase))
            return CardType.TRAP;
        throw new ArgumentException("Tipo de carta desconhecido");
    }

    private static CardSubType MapDtoTypeAndRaceToSubType(string dtoType, string dtoRace) 
    {
        switch (dtoType)
        {
            case string t when t.Contains("monster", StringComparison.CurrentCultureIgnoreCase):
                if (dtoType.Contains("fusion", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.FUSION;
                else if (dtoType.Contains("ritual", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.RITUAL;
                else if (dtoType.Contains("synchro", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.SYNCHRO;
                else if (dtoType.Contains("xyz", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.XYZ;
                else if (dtoType.Contains("link", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.LINK;
                else if (dtoType.Contains("pendulum", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.PENDULUM;
                else if (dtoType.Contains("effect", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.EFFECT;
                else
                    return CardSubType.NORMAL;
            case string t when t.Contains("spell", StringComparison.CurrentCultureIgnoreCase):
                if (dtoRace.Contains("continuous", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.CONTINUOUS;
                else if (dtoRace.Contains("field", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.FIELD;
                else if (dtoRace.Contains("equip", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.EQUIPAMENT;
                else if (dtoRace.Contains("quick", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.QUICK;
                else
                    return CardSubType.NORMAL;
            case string t when t.Contains("trap", StringComparison.CurrentCultureIgnoreCase):
                if (dtoRace.Contains("continuous", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.CONTINUOUS;
                else if (dtoRace.Contains("counter", StringComparison.CurrentCultureIgnoreCase))
                    return CardSubType.COUNTER;
                else
                    return CardSubType.NORMAL;
        }
        throw new ArgumentException("Tipo ou raça de carta desconhecido");
    }

    private static CardRace? MapDtoRaceToCardRace(string dtoRace)
    {
        if (Enum.TryParse<CardRace>(dtoRace.Replace("-", "_"), true, out var race)) { return race; }
        return null;
    }
}