using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AddActiveBanlistToGalera : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActiveBanlistId",
                table: "Galeras",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Galeras_ActiveBanlistId",
                table: "Galeras",
                column: "ActiveBanlistId");

            migrationBuilder.AddForeignKey(
                name: "FK_Galeras_Banlists_ActiveBanlistId",
                table: "Galeras",
                column: "ActiveBanlistId",
                principalTable: "Banlists",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Galeras_Banlists_ActiveBanlistId",
                table: "Galeras");

            migrationBuilder.DropIndex(
                name: "IX_Galeras_ActiveBanlistId",
                table: "Galeras");

            migrationBuilder.DropColumn(
                name: "ActiveBanlistId",
                table: "Galeras");
        }
    }
}
