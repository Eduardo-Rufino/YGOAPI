using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Banlist;

public class BanlisttDto
{
    public string Name { get; set; }
    public List<CardLimitation> Banlist { get; set; }
}

public class CardLimitation
{
    public int CardId { get; set; }
    public CardBanStatus Status { get; set; }
}