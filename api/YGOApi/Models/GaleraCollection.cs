using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YGOApi.Models;

public class GaleraCollection
{
    [Key]
    [Required]
    public int Id { get; set; }
    public int GaleraId { get; set; }
    public int CardCollectionId { get; set;}

    [ForeignKey(nameof(GaleraId))]
    public virtual Galera Galera { get; set; }

    [ForeignKey(nameof(CardCollectionId))]
    public virtual CardCollection CardCollection { get; set; }
}