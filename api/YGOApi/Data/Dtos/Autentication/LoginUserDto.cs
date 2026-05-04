using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Autentication
{
    public class LoginUserDto
    {
       public string UserName { get; set; }

       public string Password { get; set; }

    }
}
