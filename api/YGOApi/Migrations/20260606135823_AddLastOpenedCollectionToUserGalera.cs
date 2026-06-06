using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AddLastOpenedCollectionToUserGalera : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LastOpenedCollectionId",
                table: "UserGalera",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGalera_LastOpenedCollectionId",
                table: "UserGalera",
                column: "LastOpenedCollectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGalera_CardCollections_LastOpenedCollectionId",
                table: "UserGalera",
                column: "LastOpenedCollectionId",
                principalTable: "CardCollections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserGalera_CardCollections_LastOpenedCollectionId",
                table: "UserGalera");

            migrationBuilder.DropIndex(
                name: "IX_UserGalera_LastOpenedCollectionId",
                table: "UserGalera");

            migrationBuilder.DropColumn(
                name: "LastOpenedCollectionId",
                table: "UserGalera");
        }
    }
}
