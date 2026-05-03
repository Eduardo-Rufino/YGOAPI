using Microsoft.AspNetCore.Mvc;
using YGOApi.Autenticator;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]

public class LoginController : ControllerBase
{
    public LoginController()
    {
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult LoginUser([FromBody] User user)
    {
        if (user == null) return BadRequest();

        var token = AutenticatorService.GerarToken(user);
        return Ok(new { Token = token });
    }
}

