using YGOApi.Data.Dtos;
using YGOApi.Models;
using AutoMapper;

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
