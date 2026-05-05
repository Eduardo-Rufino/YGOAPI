using Microsoft.EntityFrameworkCore;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

[Table("DeckCards")]
public class DeckCard
{
    [Key]
    [Required]
    public int Id { get; set; }

    public int DeckId { get; set; }

    public int CardId { get; set; }
    
    [Range(1, 3, ErrorMessage = "Deve conter entre 1 e 3 cartas no deck")]
    [DefaultValue(1)]
    public int Quantity { get; set; } = 1;

    
    [ForeignKey(nameof(DeckId))]
    public virtual Deck Deck { get; set; }
        
    [ForeignKey(nameof(CardId))]
    public virtual Card Card { get; set; }



}