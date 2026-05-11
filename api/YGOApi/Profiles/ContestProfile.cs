using AutoMapper;
using YGOApi.Data.Dtos.Contest;
using YGOApi.Models;

namespace YGOApi.Profiles;

public class ContestProfile : Profile
{
    public ContestProfile()
    {
        CreateMap<CreateContestDto, Contest>();
        CreateMap<Contest, CreateContestDto>();
    }
}