using System.Collections.Generic;
using System.Linq;
using YGOApi.Data;

namespace YGOApi.Services.Gatcha
{
    public class GatchaService : IGatchaService
    {
        private readonly WriteContext _context;

        public GatchaService(WriteContext context)
        {
            _context = context;
        }

        public void DecrementCardsStock(List<int> cardIds)
        {
            // Agrupar IDs para saber quanto decrementar de cada carta
            var groupedIds = cardIds
                .GroupBy(id => id)
                .Select(g => new { CardId = g.Key, Count = g.Count() })
                .ToList();

            var ids = groupedIds.Select(g => g.CardId).ToList();

            // Buscar as cartas no banco
            var cards = _context.Cards
                .Where(c => ids.Contains(c.Id))
                .ToList();

            foreach (var card in cards)
            {
                var decrement = groupedIds.First(g => g.CardId == card.Id).Count;
                
                // Decrementar o estoque, garantindo que não fique negativo
                card.Quantity = Math.Max(0, card.Quantity - decrement);
            }

            _context.SaveChanges();
        }
    }
}
