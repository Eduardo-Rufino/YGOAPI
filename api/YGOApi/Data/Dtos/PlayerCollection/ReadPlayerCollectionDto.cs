using System.ComponentModel;

namespace YGOApi.Data.Dtos.PlayerCollection;

public class ReadPlayerCollectionDto
{
    public int Id { get; set; }
    public int CardId { get; set; }
    public int PlayerId { get; set; }

    [DefaultValue(1)]
    public int Quantity { get; set; } 
}