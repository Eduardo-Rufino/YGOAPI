using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Autentication
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "O Nome é obrigatório")]
        [StringLength(60, ErrorMessage = "O tamanho máximo Nome não pode exceder 60 caracteres")]
        public string Name { get; set; }

        [Required(ErrorMessage = "O username é obrigatório")]
        [StringLength(25, ErrorMessage = "O tamanho máximo username não pode exceder 25 caracteres")]
        [RegularExpression(@"^[a-zA-Z0-9]+$", ErrorMessage = "O username deve conter apenas letras e números")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória")]
        [StringLength(25, ErrorMessage = "O tamanho máximo da senha não pode exceder 25 caracteres")]
        [PasswordPropertyText(true)]
        public string Password { get; set; }

        public UserRole Role { get; set; }
    }
}
