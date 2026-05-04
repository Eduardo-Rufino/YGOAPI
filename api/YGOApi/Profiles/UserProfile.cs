using AutoMapper;
using YGOApi.Data.Dtos.Autentication;
using YGOApi.Models;

namespace YGOApi.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<RegisterUserDto, User>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<User, UpdateUserDto>();
            CreateMap<User, ReadUserDto>();            
        }
    }
}
