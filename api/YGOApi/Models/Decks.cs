using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class Decks
{
    [Key]
    [Required]
    public int Id { get; set; }

    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; }

    [Required(ErrorMessage ="O Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
    public string Name { get; set; }

    public string? DeckCover { get; set; }

    public virtual ICollection<DeckCard> DeckCards { get; set; }
}