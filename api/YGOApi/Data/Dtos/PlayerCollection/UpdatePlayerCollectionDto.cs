using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YGOApi.Data.Dtos.PlayerCollection
{
    public class UpdatePlayerCollectionDto
    {
        public int CardId { get; set; }

        public int Quantity { get; set; }
    }
}
