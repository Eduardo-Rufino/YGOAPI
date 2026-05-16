using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class User
{
    [Key]
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage ="O Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
    public string Name { get; set; }

    [Required(ErrorMessage = "O username é obrigatório")]
    public string UserName { get; set; }

    [Required(ErrorMessage = "O password é obrigatório")]
    public string Password { get; set; }
    public UserRole Role { get; set; } 
}