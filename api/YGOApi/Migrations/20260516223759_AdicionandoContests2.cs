using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoContests2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contests_Users_WinnerId",
                table: "Contests");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Users_Player2Id",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Contests_WinnerId",
                table: "Contests");

            migrationBuilder.DropColumn(
                name: "CurrentStage",
                table: "Contests");

            migrationBuilder.DropColumn(
                name: "IsFinished",
                table: "Contests");

            migrationBuilder.DropColumn(
                name: "WinnerId",
                table: "Contests");

            migrationBuilder.AlterColumn<int>(
                name: "Player2Id",
                table: "Matches",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Users_Player2Id",
                table: "Matches",
                column: "Player2Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Users_Player2Id",
                table: "Matches");

            migrationBuilder.AlterColumn<int>(
                name: "Player2Id",
                table: "Matches",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "CurrentStage",
                table: "Contests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFinished",
                table: "Contests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "WinnerId",
                table: "Contests",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contests_WinnerId",
                table: "Contests",
                column: "WinnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contests_Users_WinnerId",
                table: "Contests",
                column: "WinnerId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Users_Player2Id",
                table: "Matches",
                column: "Player2Id",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
