using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Deck
{
    public class UpdateDeckDto
    {
        public string Name { get; set; }

        public string? DeckCover { get; set; }

    }
}
