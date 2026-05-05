using Microsoft.EntityFrameworkCore;
using YGOApi.Models;

namespace YGOApi.Data
{
    public class WriteContext : DbContext
    {
        public WriteContext(DbContextOptions<WriteContext> opts)
            :base(opts)
        {
                
        }

        public DbSet<Card> Cards { get; set; }
        public DbSet<Deck> Decks { get; set; }
        public DbSet<DeckCard> DeckCards { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<PlayerCollection> PlayerCollections { get; set; }
    }
}
