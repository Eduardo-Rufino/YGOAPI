using YGOApi.Models;

namespace YGOApi.Services.Autenticator
{
    public interface IAutenticatorService
    {
        public string GerarToken(User user);

        public void GenerateHashPassword(ref User user);

        public bool Login(User usuarioNoBanco, string senhaDigitada);

    }
}
