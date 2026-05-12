using System.ComponentModel.DataAnnotations;

namespace YGOApi.Models;

public class Banlist
{
    [Key]
    [Required]
    public int Id { get; set; }

    public string Name { get; set; }

    public string? ForbiddenCardsIds { get; set; } // Banned cards
    public string? LimitedCardsIds { get; set; } // Limited in 1 card per deck
    public string? SemiLimitedCardsIds { get; set; } // Limited in 2 cards per deck
}