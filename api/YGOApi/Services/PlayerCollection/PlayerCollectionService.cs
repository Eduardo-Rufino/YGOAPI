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
            // Agrupar as novas cartas por ID para evitar duplicatas na lógica e no banco
            var groupedNewCards = newCards
                .GroupBy(c => c.CardId)
                .Select(g => new UpdatePlayerCollectionDto
                {
                    CardId = g.Key,
                    Quantity = g.Sum(c => c.Quantity)
                })
                .ToList();

            var cardsToUpdate = _context.PlayerCollections
                .Where(pc => pc.PlayerId == playerId && groupedNewCards.Select(c => c.CardId).Contains(pc.CardId))
                .ToList();

            var cardsToAdd = groupedNewCards.Where(nc => !cardsToUpdate.Any(ctu => ctu.CardId == nc.CardId)).ToList();

            int added = 0, updated = 0;

            if (cardsToUpdate.Count > 0)
            {
                foreach (var cardInDb in cardsToUpdate)
                {
                    var incomingCard = groupedNewCards.FirstOrDefault(c => c.CardId == cardInDb.CardId);
                    if (incomingCard != null)
                    {
                        cardInDb.Quantity += incomingCard.Quantity;
                        updated++;
                    }
                }

                _context.PlayerCollections.UpdateRange(cardsToUpdate);
            }

            if (cardsToAdd.Count > 0)
            {
                var toAdd = cardsToAdd.Select(card => new YGOApi.Models.PlayerCollection
                {
                    PlayerId = playerId,
                    CardId = card.CardId,
                    Quantity = card.Quantity
                }).ToList();
                _context.PlayerCollections.AddRange(toAdd);
                added += toAdd.Count;
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
