using YGOApi.Data.Dtos.PlayerCollection;

namespace YGOApi.Services.PlayerCollection
{
    public interface IPlayerCollectionService
    {
        public (int added, int updated) AddCards(int playerId, List<UpdatePlayerCollectionDto> newCards);

        public (int removed, int updated) RemoveCards(int playerId, List<UpdatePlayerCollectionDto> cardsToRemove);
    }
}
