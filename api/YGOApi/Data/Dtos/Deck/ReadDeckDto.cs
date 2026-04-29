using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Deck
{
    public class ReadDeckDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string? DeckCover { get; set; }

        public DateTime HoraDaConsulta { get; set; } = DateTime.Now;
    }
}
