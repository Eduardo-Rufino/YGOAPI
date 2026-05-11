using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.Galera;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GaleraController : ControllerBase
{
    private WriteContext _context;

    public GaleraController(WriteContext context)
    {
        _context = context;
    }

    [HttpPatch("AddMembers/{galeraId}")]
    [Authorize("Admin")]
    public IActionResult AddMembers(int galeraId, [FromBody] List<int> membersId) 
    {
        _context.UserGalera.AddRange(membersId.Select(memberId => new UserGalera
        {
            UserId = memberId,
            GaleraId = galeraId,
        }).ToList());
        
        _context.SaveChanges();
        return Ok();
    }

    [HttpPatch("RemoveMembers/{galeraId}")]
    [Authorize("Admin")]
    public IActionResult RemoveMember(int galeraId, [FromQuery] int memberId)
    {
        var user = _context.UserGalera.FirstOrDefault(x => x.GaleraId == galeraId && x.UserId == memberId);
        if (user == null)
        {
            return BadRequest("Usuário não pertence à galera");
        }
        _context.UserGalera.Remove(user);

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
        var galeraId = members?.FirstOrDefault()?.Id;

        var collections = galeraId != null ? _context.Galeras.Where(x => x.Id == galeraId) : null;

        return Ok(new{ members, collections});
    }

    [HttpPost]
    [Authorize("Admin")]
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
    [Authorize("Admin")]
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