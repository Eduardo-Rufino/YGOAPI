using CloudinaryDotNet.Actions;
using YGOApi.Models;

namespace YGOApi.Services.Storage;

public interface IStorageService
{
    Uri Upload(StreamContent arquive, string name, string folder);
}