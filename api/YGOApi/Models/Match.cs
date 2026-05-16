using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class Match
{
    [Key]
    [Required]
    public int Id { get; set; }
    public int ContestId { get; set; }
    public int Player1Id { get; set; }
    public int? Player2Id { get; set; }
    public int? WinnerId { get; set; }
    public ContestStage Stage { get; set; } = ContestStage.GROUP;

    #region Foreign Keys
    [ForeignKey(nameof(ContestId))]
    public virtual Contest Contest { get; set; }

    [ForeignKey(nameof(Player1Id))]
    public virtual User Player1 { get; set; }

    [ForeignKey(nameof(Player2Id))]
    public virtual User Player2 { get; set; }
    #endregion
}