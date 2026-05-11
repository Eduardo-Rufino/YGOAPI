using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Contest;

public class CreateContestDto
{
    public int GaleraId { get; set; }

    public int? BanlistId { get; set; }

    public string Name { get; set; }

    public ContestType Type { get; set; } = ContestType.ROUND_ROBIN;
}