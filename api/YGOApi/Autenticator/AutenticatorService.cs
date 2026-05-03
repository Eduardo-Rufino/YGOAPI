using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Autenticator
{
    public static class AutenticatorService
    {
        public static string GerarToken(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var name = user.Name ?? string.Empty;
            var roleName = Enum.GetName<UserRole>(user.Role) ?? user.Role.ToString();

            var key = Encoding.ASCII.GetBytes("GXnY9r6HYhCBTCm0VmOajxhBUX1MNhowtdJvEu+9PWE=");

            
            var tokenConfig = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, name),
                    new Claim(ClaimTypes.Role, roleName)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenConfig);

            return tokenHandler.WriteToken(token);
        }
    }
}
