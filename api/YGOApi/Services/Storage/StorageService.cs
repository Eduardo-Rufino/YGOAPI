using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Services.Storage
{
    public class StorageService(IConfiguration configuration) : IStorageService
    {
        public void Upload(StreamContent arquive)
        {
            string apiKey = configuration.GetSection("Cloudinary:ApiKey").Value;
            string apiSecret = configuration.GetSection("Cloudinary:ApiSecret").Value;
            string cloudName = configuration.GetSection("Cloudinary:CloudName").Value;
            string cloudinaryUrl = $"cloudinary://{apiKey}:{apiSecret}@{cloudName}";

                var account = new Account(cloudName, apiKey, apiSecret);
                var cloudinary = new Cloudinary(account);
        }
    }
}
