using YGOApi.Data.Dtos;
using YGOApi.Models;
using YGOApi.Data.Dtos.YgoProDeck;

namespace YGOApi.Data
{
    public class CardFactory
    {
        // classe que controla a conversão de Dtos para Models e vice versa, para evitar acoplamento entre as camadas
         public static Card CreateCardFromDto(CreateCardDto dto)
         {
            return new Card
            {
                Nome = dto.Nome,
                Atributo = dto.Atributo,
                Nivel = dto.Nivel,
                Tipo = dto.Tipo,
                Efeito = dto.Efeito,
                ATK = dto.ATK,
                DEF = dto.DEF,
                Colecao = dto.Colecao
            };
         }

        public static Card CreateCardFromYgoProDeckDto(YgoProDeckCardDto dto)
        {
            return new Card
            {
                Nome = dto.Name,
                Atributo = dto.Attribute,
                Nivel = dto.Level ?? 0,
                ATK = dto.Atk ?? 0,
                DEF = dto.Def ?? 0,
                Efeito = dto.Desc,
                Tipo = dto.TypeLine[0],
                Colecao = dto.CardSet ?? string.Empty
            };
        }

    }
}
