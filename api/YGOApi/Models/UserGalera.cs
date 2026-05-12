using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YGOApi.Models;

public class UserGalera
{
    [Key]
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "O Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
    public int UserId { get; set; }

    public int GaleraId { get; set; }

    public int DuelPoints { get; set; } = 0;

    #region Foreign Keys
    [ForeignKey(nameof(GaleraId))]
    public virtual Galera Galera { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; }
    #endregion  
}