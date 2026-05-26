using YGOApi.Models;

namespace YGOApi.Services.Storage
{
    public interface IStorageService
    {
        void Upload(StreamContent arquive);

    }
}
