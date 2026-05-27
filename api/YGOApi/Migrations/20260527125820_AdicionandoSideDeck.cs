using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoSideDeck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .Annotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .Annotation("Npgsql:Enum:card_location", "main_deck,side_deck")
                .Annotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .Annotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .Annotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .Annotation("Npgsql:Enum:collection_type", "collection,tournament_pack,starter_deck")
                .Annotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .Annotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .Annotation("Npgsql:Enum:user_role", "admin,player")
                .OldAnnotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .OldAnnotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .OldAnnotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .OldAnnotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .OldAnnotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .OldAnnotation("Npgsql:Enum:collection_type", "collection,tournament_pack,starter_deck")
                .OldAnnotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .OldAnnotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .OldAnnotation("Npgsql:Enum:user_role", "admin,player");

            migrationBuilder.AddColumn<int>(
                name: "Location",
                table: "DeckCards",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "DeckCards");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .Annotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .Annotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .Annotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .Annotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .Annotation("Npgsql:Enum:collection_type", "collection,tournament_pack,starter_deck")
                .Annotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .Annotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .Annotation("Npgsql:Enum:user_role", "admin,player")
                .OldAnnotation("Npgsql:Enum:card_atribute", "dark,light,earth,water,fire,wind,divine")
                .OldAnnotation("Npgsql:Enum:card_ban_status", "unlimited,semi_limited,limited,banned")
                .OldAnnotation("Npgsql:Enum:card_location", "main_deck,side_deck")
                .OldAnnotation("Npgsql:Enum:card_race", "aqua,beast,beast_warrior,cyberse,dinosaur,divine_beast,dragon,fairy,fiend,fish,insect,ilusion,machine,plant,psychic,pyro,reptile,rock,sea_serpent,spellcaster,thunder,warrior,winged_beast,wyrm,zombie")
                .OldAnnotation("Npgsql:Enum:card_sub_type", "normal,effect,fusion,ritual,synchro,xyz,link,pendulum,continuous,field,equipament,quick,counter")
                .OldAnnotation("Npgsql:Enum:card_type", "monster,spell,trap")
                .OldAnnotation("Npgsql:Enum:collection_type", "collection,tournament_pack,starter_deck")
                .OldAnnotation("Npgsql:Enum:contest_stage", "group,round_of_sixteen,quarter_finals,semi_finals,final")
                .OldAnnotation("Npgsql:Enum:contest_type", "round_robin,tournament")
                .OldAnnotation("Npgsql:Enum:user_role", "admin,player");
        }
    }
}
