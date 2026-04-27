using AutoMapper;
using YGOApi.Data.Dtos;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Profiles
{
    public class CardProfile : Profile
    {
        public CardProfile()
        {
            CreateMap<CreateCardDto, Card>();
            CreateMap<UpdateCardDto, Card>();
            CreateMap<Card, UpdateCardDto>();
            CreateMap<Card, ReadCardDto>();            
        }
    }
}
