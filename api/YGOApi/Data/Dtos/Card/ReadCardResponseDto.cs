using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Card
{
    public class ReadCardResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public CardAtribute? Attribute { get; set; }

        public int? Level { get; set; }

        public CardType Type { get; set; }

        public CardSubType SubType { get; set; }

        public CardRace? Race { get; set; }

        public string Effect { get; set; }

        public int? Attack { get; set; }

        public int? Defense { get; set; }

        public string Collection { get; set; }

        public string? Archetype { get; set; }

        public int? PendulumScale { get; set; }

        public int? LinkRating { get; set; }

        public string? LinkMarkers { get; set; }

        public CardBanStatus BanStatus { get; set; } = CardBanStatus.UNLIMITED;

        public string? ImageUrl { get; set; }

        public bool HasCard { get; set; }

        public DateTime HoraDaConsulta { get; set; } = DateTime.Now;
    }
}
