using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Services.Storage;

public class StorageService(IConfiguration configuration) : IStorageService
{
    public Uri Upload(StreamContent arquive, string name, string folder)
    {
        string apiKey = configuration.GetSection("Cloudinary:ApiKey").Value;
        string apiSecret = configuration.GetSection("Cloudinary:ApiSecret").Value;
        string cloudName = configuration.GetSection("Cloudinary:CloudName").Value;
        string cloudinaryUrl = $"cloudinary://{apiKey}:{apiSecret}@{cloudName}";

        var account = new Account(cloudName, apiKey, apiSecret);
        var cloudinary = new Cloudinary(account);
        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(name, arquive.ReadAsStream()),
            Folder = folder
        };

        var response = cloudinary.Upload(uploadParams);
        return response.SecureUrl;
    }
}