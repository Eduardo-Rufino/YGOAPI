using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Autenticator
{
    public class AutenticatorService(IConfiguration configuration, IPasswordHasher<User> passwordHasher) : IAutenticatorService
    {
        public void GenerateHashPassword(ref User user)
        {            
            user.Password = passwordHasher.HashPassword(user, user.Password);            
        }

        public string GerarToken(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var userName = user.UserName ?? string.Empty;
            var roleName = Enum.GetName<UserRole>(user.Role) ?? user.Role.ToString();

            var key = Encoding.ASCII.GetBytes(configuration.GetSection("Jwt:Key").Value);
            
            var tokenConfig = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, userName),
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

        public bool Login(User usuarioNoBanco, string senhaDigitada)
        {
            // Verifica se a senha digitada "bate" com o hash do banco
            var result = passwordHasher.VerifyHashedPassword(usuarioNoBanco, usuarioNoBanco.Password, senhaDigitada);

            return result == PasswordVerificationResult.Success;
        }
    }
}
