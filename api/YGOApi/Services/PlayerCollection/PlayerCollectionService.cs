using YGOApi.Data;
using YGOApi.Data.Dtos.PlayerCollection;

namespace YGOApi.Services.PlayerCollection
{
    public class PlayerCollectionService : IPlayerCollectionService
    {
        private readonly WriteContext _context;

        public PlayerCollectionService(WriteContext context)
        {
            _context = context;
        }

        public (int added, int updated) AddCards(int playerId, List<UpdatePlayerCollectionDto> newCards)
        {
            if (newCards == null || newCards.Count == 0)
            {
                return (0, 0);
            }

            var groupedNewCards = newCards
                .GroupBy(c => c.CardId)
                .Select(g => new UpdatePlayerCollectionDto
                {
                    CardId = g.Key,
                    Quantity = g.Sum(c => c.Quantity)
                })
                .ToList();

            var requestedCardIds = groupedNewCards.Select(c => c.CardId).ToList();
            var existingCards = _context.PlayerCollections
                .Where(pc => pc.PlayerId == playerId && requestedCardIds.Contains(pc.CardId))
                .ToList();

            int added = 0, updated = 0;

            foreach (var incomingCard in groupedNewCards)
            {
                var currentEntry = existingCards.FirstOrDefault(c => c.CardId == incomingCard.CardId);

                if (currentEntry != null)
                {
                    currentEntry.Quantity += incomingCard.Quantity;
                    updated++;
                }
                else
                {
                    _context.PlayerCollections.Add(new YGOApi.Models.PlayerCollection
                    {
                        PlayerId = playerId,
                        CardId = incomingCard.CardId,
                        Quantity = incomingCard.Quantity
                    });
                    added++;
                }
            }

            _context.SaveChanges();

            return (added, updated);
        }

        public (int removed, int updated) RemoveCards(int playerId, List<UpdatePlayerCollectionDto> cardsToRemove)
        {
            throw new NotImplementedException();
        }
    }
}
