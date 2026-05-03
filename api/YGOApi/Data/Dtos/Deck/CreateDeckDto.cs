using System.ComponentModel.DataAnnotations;

namespace YGOApi.Data.Dtos.Deck
{
    public class CreateDeckDto
    {
        [Required(ErrorMessage = "O Nome é obrigatório")]
        [StringLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
        public string Name { get; set; }

        public string? DeckCover { get; set; }
    }
}
