using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class CriandoGatcha : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Collection",
                table: "Cards");

            migrationBuilder.RenameColumn(
                name: "BanStatus",
                table: "Cards",
                newName: "Rarity");

            migrationBuilder.AlterColumn<int>(
                name: "CollectionId",
                table: "Cards",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Cards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards",
                column: "CollectionId",
                principalTable: "CardCollections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Cards");

            migrationBuilder.RenameColumn(
                name: "Rarity",
                table: "Cards",
                newName: "BanStatus");

            migrationBuilder.AlterColumn<int>(
                name: "CollectionId",
                table: "Cards",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Collection",
                table: "Cards",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards",
                column: "CollectionId",
                principalTable: "CardCollections",
                principalColumn: "Id");
        }
    }
}
