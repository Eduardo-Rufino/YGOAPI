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
            CreateMap<CreateDeckDto, Deck>();
            CreateMap<UpdateDeckDto, Deck>();
            CreateMap<Deck, UpdateDeckDto>();
            CreateMap<Deck, ReadDeckDto>()
                .ForMember(dest => dest.CardCount, opt => opt.MapFrom(src => src.DeckCards.Sum(c => c.Quantity)));            
        }
    }
}
