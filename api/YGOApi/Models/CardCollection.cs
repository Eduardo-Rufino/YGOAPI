using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Models;

public class CardCollection
{
    [Key]
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "O Nome é obrigatório")]
    [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
    public string Name { get; set; }

    public CollectionType Type { get; set; } = CollectionType.COLLECTION;
}