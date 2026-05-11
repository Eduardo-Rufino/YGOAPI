using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class Contest
{
    [Key]
    [Required]
    public int Id { get; set; }

    public int GaleraId { get; set; }

    public int? BanlistId { get; set; }

    public string Name { get; set; }

    public ContestType Type { get; set; }

    #region Foreign Keys
    [ForeignKey(nameof(GaleraId))]
    public virtual Galera Galera { get; set; }

    [ForeignKey(nameof(BanlistId))]
    public virtual Banlist Banlist { get; set; }
    #endregion
}