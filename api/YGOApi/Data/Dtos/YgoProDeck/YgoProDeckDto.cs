namespace YGOApi.Data.Dtos.YgoProDeck
{
    public class YgoProDeckDto
    {
        public List<YgoProDeckCardDto> Data { get; set; }
    }

    public class YgoProDeckCardDto
    {
        public string Name { get; set; }
        public List<string> TypeLine { get; set; }
        public string Type { get; set; }
        public string Desc { get; set; }
        public string Race { get; set; }
        public int? Atk { get; set; }
        public int? Def { get; set; }
        public int? Level { get; set; }
        public string? Attribute { get; set; }
        public string? Archetype { get; set; }
        public int? Scale { get; set; }
        public int? LinkVal { get; set; }
        public List<string>? LinkMarkers { get; set; }

        public string? CardSet { get; set; } = string.Empty;
    }
}
