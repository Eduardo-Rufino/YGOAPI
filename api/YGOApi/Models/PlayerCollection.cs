using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YGOApi.Models;

[Table("PlayerCollection")]
public class PlayerCollection
{
    [Key]
    [Required]
    public int Id { get; set; }

    public int CardId { get; set; }

    public int PlayerId { get; set; }

    [DefaultValue(1)]
    public int Quantity { get; set; } = 1;    
    
    [ForeignKey(nameof(CardId))]
    public virtual Card Card { get; set; }
        
    [ForeignKey(nameof(PlayerId))]
    public virtual User Player { get; set; }
}