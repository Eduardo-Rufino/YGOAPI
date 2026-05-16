using Microsoft.EntityFrameworkCore;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Data;

public class WriteContext : DbContext
{
    public WriteContext(DbContextOptions<WriteContext> opts) :base(opts) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Registra os Enums nativos no Postgres
        modelBuilder.HasPostgresEnum<CardAtribute>();
        modelBuilder.HasPostgresEnum<CardBanStatus>();
        modelBuilder.HasPostgresEnum<CardRace>();
        modelBuilder.HasPostgresEnum<CardSubType>();
        modelBuilder.HasPostgresEnum<CardType>();
        modelBuilder.HasPostgresEnum<UserRole>();
        modelBuilder.HasPostgresEnum<ContestType>();
        modelBuilder.HasPostgresEnum<ContestStage>();

        base.OnModelCreating(modelBuilder);
    }

    public DbSet<Card> Cards { get; set; }
    public DbSet<Deck> Decks { get; set; }
    public DbSet<DeckCard> DeckCards { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<PlayerCollection> PlayerCollections { get; set; }
    public DbSet<Galera> Galeras { get; set; }
    public DbSet<UserGalera> UserGalera { get; set; }
    public DbSet<CardCollection> CardCollections { get; set; }
    public DbSet<GaleraCollection> GaleraCollections { get; set; }
    public DbSet<Contest> Contests { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<Banlist> Banlists { get; set; }
}