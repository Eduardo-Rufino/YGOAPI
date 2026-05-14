using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;

namespace YGOApi.Data.Dtos.Autentication
{
    public class ReadUserDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string UserName { get; set; }

        public UserRole Role { get; set; }


    }
}
