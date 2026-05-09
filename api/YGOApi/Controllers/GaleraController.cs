using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.Autentication;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.Galera;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GaleraController : ControllerBase
{
    private WriteContext _context;
    private IMapper _mapper;

    public GaleraController(WriteContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpPatch("AddMembers/{galeraId}")]
    public IActionResult AddMembers(int galeraId, [FromBody] List<int> membersId) 
    {
        _context.UserGalera.AddRange(membersId.Select(memberId => new UserGalera
        {
            UserId = memberId,
            GaleraId = galeraId
        }));
        
        _context.SaveChanges();
        return Ok();
    }

    [HttpGet]
    [Authorize("Player")]
    public IActionResult GetGalera([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _context.Users.Where(x => x.UserName == userName).FirstOrDefault()
            ?? throw new UnauthorizedAccessException("User not found");

        var members = _context.UserGalera.Where(x => x.UserId == user.Id).ToList();

        return Ok(members);
    }

    
    [HttpPost]
    public IActionResult AddGalera([FromBody] CreateGaleraDto galeraDto)
    {
        var galera = new Galera
        {
            Name = galeraDto.Name
        };
        _context.Galeras.Add(galera);
        _context.SaveChanges();
        return Ok(galera);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteGalera(int id)
    {
        var galera = _context.Galeras.FirstOrDefault(
            galera => galera.Id == id);
        if (galera == null) return NotFound();
        _context.Galeras.Remove(galera);
        _context.SaveChanges();
        return NoContent();
    }
}

