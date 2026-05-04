using Microsoft.EntityFrameworkCore;
using YGOApi.Models;

namespace YGOApi.Data
{
    public class CardContext : DbContext
    {
        public CardContext(DbContextOptions<CardContext> opts)
            :base(opts)
        {
                
        }

        public DbSet<Card> Cards { get; set; }
        public DbSet<Decks> Decks { get; set; }
        public DbSet<DeckCard> DeckCards { get; set; }

        public DbSet<User> User { get; set; }

        public DbSet<PlayerCollection> PlayerCollections { get; set; }
    }
}
