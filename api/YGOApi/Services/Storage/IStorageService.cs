using CloudinaryDotNet.Actions;
using YGOApi.Models;

namespace YGOApi.Services.Storage
{
    public interface IStorageService
    {
        ImageUploadResult Upload(StreamContent arquive, string name, string folder);

    }
}
