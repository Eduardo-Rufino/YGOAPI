using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace YGOApi.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoGalera : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Collection",
                table: "Cards",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "CollectionId",
                table: "Cards",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrlSmall",
                table: "Cards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CardCollections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardCollections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Galeras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Galeras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGalera",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", maxLength: 60, nullable: false),
                    GaleraId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGalera", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GaleraCollections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GaleraId = table.Column<int>(type: "integer", nullable: false),
                    CardCollectionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GaleraCollections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GaleraCollections_CardCollections_CardCollectionId",
                        column: x => x.CardCollectionId,
                        principalTable: "CardCollections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GaleraCollections_Galeras_GaleraId",
                        column: x => x.GaleraId,
                        principalTable: "Galeras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cards_CollectionId",
                table: "Cards",
                column: "CollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_GaleraCollections_CardCollectionId",
                table: "GaleraCollections",
                column: "CardCollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_GaleraCollections_GaleraId",
                table: "GaleraCollections",
                column: "GaleraId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards",
                column: "CollectionId",
                principalTable: "CardCollections",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cards_CardCollections_CollectionId",
                table: "Cards");

            migrationBuilder.DropTable(
                name: "GaleraCollections");

            migrationBuilder.DropTable(
                name: "UserGalera");

            migrationBuilder.DropTable(
                name: "CardCollections");

            migrationBuilder.DropTable(
                name: "Galeras");

            migrationBuilder.DropIndex(
                name: "IX_Cards_CollectionId",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "CollectionId",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "ImageUrlSmall",
                table: "Cards");

            migrationBuilder.AlterColumn<string>(
                name: "Collection",
                table: "Cards",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
