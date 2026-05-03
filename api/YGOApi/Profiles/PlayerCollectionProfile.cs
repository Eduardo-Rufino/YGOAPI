using AutoMapper;
using YGOApi.Data.Dtos.Card;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.PlayerCollection;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Models;

namespace YGOApi.Profiles
{
    public class PlayerCollectionProfile : Profile
    {
        public PlayerCollectionProfile()
        {
            CreateMap<UpdatePlayerCollectionDto, PlayerCollection>();
            CreateMap<PlayerCollection, UpdatePlayerCollectionDto>();
            CreateMap<PlayerCollection, ReadPlayerCollectionDto>();            
        }
    }
}
