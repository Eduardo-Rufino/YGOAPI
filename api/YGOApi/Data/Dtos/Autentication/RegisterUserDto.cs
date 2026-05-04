using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Autentication
{
    public class RegisterUserDto
    {
        public string Name { get; set; }

        public string UserName { get; set; }

        public string Password { get; set; }

        public UserRole Role { get; set; } = UserRole.PLAYER;
    }
}
