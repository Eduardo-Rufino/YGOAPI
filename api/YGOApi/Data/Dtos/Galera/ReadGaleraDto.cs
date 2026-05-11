using System.ComponentModel.DataAnnotations;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Data.Dtos.Galera
{
    public class ReadGaleraDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public List<User> Members { get; set; }
    }
}
