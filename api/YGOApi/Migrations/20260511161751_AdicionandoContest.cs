using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoContest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .Annotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .Annotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .Annotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .Annotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .Annotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .Annotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .Annotation("Npgsql:Enum:user_role", "admin,player")
                .OldAnnotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .OldAnnotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .OldAnnotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .OldAnnotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .OldAnnotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .OldAnnotation("Npgsql:Enum:user_role", "admin,player");

            migrationBuilder.AddColumn<int>(
                name: "DuelPoints",
                table: "UserGalera",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Banlists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ForbiddenCardsIds = table.Column<string>(type: "text", nullable: true),
                    LimitedCardsIds = table.Column<string>(type: "text", nullable: true),
                    SemiLimitedCardsIds = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banlists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Contests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GaleraId = table.Column<int>(type: "integer", nullable: false),
                    BanlistId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contests_Banlists_BanlistId",
                        column: x => x.BanlistId,
                        principalTable: "Banlists",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Contests_Galeras_GaleraId",
                        column: x => x.GaleraId,
                        principalTable: "Galeras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContestId = table.Column<int>(type: "integer", nullable: false),
                    Player1Id = table.Column<int>(type: "integer", nullable: false),
                    Player2Id = table.Column<int>(type: "integer", nullable: false),
                    WinnerId = table.Column<int>(type: "integer", nullable: true),
                    Stage = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matches_Contests_ContestId",
                        column: x => x.ContestId,
                        principalTable: "Contests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Matches_Users_Player1Id",
                        column: x => x.Player1Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Matches_Users_Player2Id",
                        column: x => x.Player2Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contests_BanlistId",
                table: "Contests",
                column: "BanlistId");

            migrationBuilder.CreateIndex(
                name: "IX_Contests_GaleraId",
                table: "Contests",
                column: "GaleraId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_ContestId",
                table: "Matches",
                column: "ContestId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_Player1Id",
                table: "Matches",
                column: "Player1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_Player2Id",
                table: "Matches",
                column: "Player2Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "Contests");

            migrationBuilder.DropTable(
                name: "Banlists");

            migrationBuilder.DropColumn(
                name: "DuelPoints",
                table: "UserGalera");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .Annotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .Annotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .Annotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .Annotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .Annotation("Npgsql:Enum:user_role", "admin,player")
                .OldAnnotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .OldAnnotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .OldAnnotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .OldAnnotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .OldAnnotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .OldAnnotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .OldAnnotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .OldAnnotation("Npgsql:Enum:user_role", "admin,player");
        }
    }
}
