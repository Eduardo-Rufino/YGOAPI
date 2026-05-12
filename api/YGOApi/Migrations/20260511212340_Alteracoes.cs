using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class Alteracoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserGalera_GaleraId",
                table: "UserGalera",
                column: "GaleraId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGalera_UserId",
                table: "UserGalera",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGalera_Galeras_GaleraId",
                table: "UserGalera",
                column: "GaleraId",
                principalTable: "Galeras",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserGalera_Users_UserId",
                table: "UserGalera",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserGalera_Galeras_GaleraId",
                table: "UserGalera");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGalera_Users_UserId",
                table: "UserGalera");

            migrationBuilder.DropIndex(
                name: "IX_UserGalera_GaleraId",
                table: "UserGalera");

            migrationBuilder.DropIndex(
                name: "IX_UserGalera_UserId",
                table: "UserGalera");
        }
    }
}
