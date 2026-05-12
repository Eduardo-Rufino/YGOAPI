using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Autenticator;
using YGOApi.Data;
using YGOApi.Data.Dtos.Autentication;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]

public class AutenticatorController : ControllerBase
{
    private readonly IAutenticatorService _autenticator;
    private WriteContext _context;
    private IMapper _mapper;

    public AutenticatorController(IAutenticatorService autenticator, WriteContext context, IMapper mapper)
    {
        _autenticator = autenticator;
        _context = context;
        _mapper = mapper;
    }

    [HttpPost("Login")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult LoginUser([FromBody] LoginUserDto userDto)
    {
        var user = _context.Users.FirstOrDefault(u => u.UserName == userDto.UserName);
        if (user == null)
        {
            throw new ArgumentException("User does not exist.");
        }

        if(!_autenticator.Login(user, userDto.Password))
        {
            throw new ArgumentException("Invalid password.");
        }
        var token = _autenticator.GerarToken(user);
        return Ok(new { Token = token });
    }

    [HttpPost("Register")]
    public IActionResult RegisterUser([FromBody] RegisterUserDto userDto)
    {
        User user = _mapper.Map<User>(userDto);
        if (user == null) return BadRequest();
        if (_context.Users.Any(u => u.UserName == user.UserName))
        {
            throw new ArgumentException("Username already exists.");
        }
        _autenticator.GenerateHashPassword(ref user);
        _context.Add(user);
        _context.SaveChanges();
        return Ok();
    }

    [HttpGet("Search")]
    public IActionResult SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new List<object>());

        var users = _context.Users
            .Where(u => u.UserName.Contains(query))
            .Take(10)
            .Select(u => new { u.Id, Username = u.UserName })
            .ToList();

        return Ok(users);
    }
}
