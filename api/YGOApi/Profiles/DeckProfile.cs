using System.Linq;
using AutoMapper;
using YGOApi.Data.Dtos.Card;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Profiles
{
    public class DeckProfile : Profile
    {
        public DeckProfile()
        {
            CreateMap<CreateDeckDto, Decks>();
            CreateMap<UpdateDeckDto, Decks>();
            CreateMap<Decks, UpdateDeckDto>();
            CreateMap<Decks, ReadDeckDto>()
                .ForMember(dest => dest.CardCount, opt => opt.MapFrom(src => src.DeckCards.Sum(c => c.Quantity)));            
        }
    }
}
