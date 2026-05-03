using AutoMapper;
using YGOApi.Data.Dtos.Card;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.User;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<User, UpdateUserDto>();
            CreateMap<User, ReadUserDto>();            
        }
    }
}
