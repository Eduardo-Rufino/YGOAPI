using System.ComponentModel.DataAnnotations;

namespace YGOApi.Models
{
    public class Card
    {
        [Key]
        [Required]
        public int Id { get; set; }
        [Required(ErrorMessage ="O Nome é obrigatório")]
        [MaxLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
        public string Nome { get; set; }
        [Required(ErrorMessage = "O Atributo é obrigatório")]
        [MaxLength(15, ErrorMessage = "O tamanho máximo Atributo não pode exceder 15 caracteres")]
        public string Atributo { get; set; }
        [Required(ErrorMessage = "O Nivel é obrigatório")]
        [Range(0, 13, ErrorMessage = "O nível deve ser entre 0 e 13")]
        public int Nivel { get; set; }
        [Required(ErrorMessage = "O Tipo é obrigatório")]
        [MaxLength(15, ErrorMessage = "O tamanho máximo Tipo não pode exceder 15 caracteres")]
        public string Tipo { get; set; }
        public string Efeito { get; set; }
        [Required(ErrorMessage = "O Ataque é obrigatório")]
        public int ATK { get; set; }
        [Required(ErrorMessage = "A Defesa é obrigatória")]
        public int DEF { get; set; }
        public string Colecao { get; set; }

    }
}
