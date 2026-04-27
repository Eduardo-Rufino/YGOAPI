using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AtualizandoTabelaCard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Atributo",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Cards");

            migrationBuilder.RenameColumn(
                name: "Nome",
                table: "Cards",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Nivel",
                table: "Cards",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "Efeito",
                table: "Cards",
                newName: "Effect");

            migrationBuilder.RenameColumn(
                name: "DEF",
                table: "Cards",
                newName: "SubType");

            migrationBuilder.RenameColumn(
                name: "Colecao",
                table: "Cards",
                newName: "Collection");

            migrationBuilder.RenameColumn(
                name: "ATK",
                table: "Cards",
                newName: "BanStatus");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Cards",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<string>(
                name: "Archetype",
                table: "Cards",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "Attack",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Attribute",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Defense",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkMarkers",
                table: "Cards",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "LinkRating",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PendulumScale",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Race",
                table: "Cards",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Archetype",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Attack",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Attribute",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Defense",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "LinkMarkers",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "LinkRating",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "PendulumScale",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Race",
                table: "Cards");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Cards",
                newName: "Nivel");

            migrationBuilder.RenameColumn(
                name: "SubType",
                table: "Cards",
                newName: "DEF");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Cards",
                newName: "Nome");

            migrationBuilder.RenameColumn(
                name: "Effect",
                table: "Cards",
                newName: "Efeito");

            migrationBuilder.RenameColumn(
                name: "Collection",
                table: "Cards",
                newName: "Colecao");

            migrationBuilder.RenameColumn(
                name: "BanStatus",
                table: "Cards",
                newName: "ATK");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Cards",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<string>(
                name: "Atributo",
                table: "Cards",
                type: "varchar(15)",
                maxLength: 15,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Cards",
                type: "varchar(15)",
                maxLength: 15,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
