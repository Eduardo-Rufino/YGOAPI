using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class UserGalera
{
    [Key]
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage ="O Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
    public int UserId { get; set; }
    
    public int GaleraId { get; set; }

    public int DuelPoints { get; set; } = 0;
}