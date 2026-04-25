using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos
{
    public class CreateCardDto
    {
        [Required(ErrorMessage = "O Nome é obrigatório")]
        [StringLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
        public string Name { get; set; }

        public CardAtribute? Attribute { get; set; }

        [Range(0, 13, ErrorMessage = "O nível deve ser entre 0 e 13")]
        public int? Level { get; set; }

        [Required(ErrorMessage = "O Tipo é obrigatório")]
        public CardType Type { get; set; }

        [Required(ErrorMessage = "O SubTipo é obrigatório")]
        public CardSubType SubType { get; set; }

        public CardRace? Race { get; set; }

        [Required(ErrorMessage = "O Efeito/Descrição é obrigatório")]
        public string Effect { get; set; }

        public int? Attack { get; set; }

        public int? Defense { get; set; }

        [Required(ErrorMessage = "A coleção é obrigatória")]
        public string Collection { get; set; }

        public string? Archetype { get; set; }

        public int? PendulumScale { get; set; }

        public int? LinkRating { get; set; }

        public string? LinkMarkers { get; set; }

        public CardBanStatus BanStatus { get; set; } = CardBanStatus.UNLIMITED;
    }
}
