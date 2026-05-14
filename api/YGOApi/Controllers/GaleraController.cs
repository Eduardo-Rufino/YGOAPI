using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.Galera;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Player")]
public class GaleraController : ControllerBase
{
    private WriteContext _context;

    public GaleraController(WriteContext context)
    {
        _context = context;
    }

    [HttpGet("My")]
    public IActionResult GetMyGaleras()
    {
        var userId = GetCurrentUserId();
        var myGaleras = _context.UserGalera
            .Where(ug => ug.UserId == userId)
            .Select(ug => new {
                ug.Galera.Id,
                ug.Galera.Name
            })
            .ToList();

        return Ok(myGaleras);
    }

    [HttpGet("{galeraId}/Members")]
    public IActionResult GetMembers(int galeraId)
    {
        var members = _context.UserGalera
            .Where(ug => ug.GaleraId == galeraId)
            .Select(ug => new ReadMemberDto
            {
                UserId = ug.UserId,
                Username = ug.User.UserName,
                DuelPoints = ug.DuelPoints
            })
            .ToList();

        return Ok(members);
    }

    [HttpPatch("AddMembers/{galeraId}")]
    public IActionResult AddMembers(int galeraId, [FromBody] List<int> membersId) 
    {
        // Optional: Check if current user is part of this galera
        var userId = GetCurrentUserId();
        if (!_context.UserGalera.Any(ug => ug.GaleraId == galeraId && ug.UserId == userId))
            return Forbid();

        foreach (var memberId in membersId)
        {
            if (!_context.UserGalera.Any(ug => ug.GaleraId == galeraId && ug.UserId == memberId))
            {
                _context.UserGalera.Add(new UserGalera
                {
                    UserId = memberId,
                    GaleraId = galeraId,
                });
            }
        }
        
        _context.SaveChanges();
        return Ok();
    }

    [HttpPatch("RemoveMembers/{galeraId}")]
    public IActionResult RemoveMember(int galeraId, [FromQuery] int memberId)
    {
        var userId = GetCurrentUserId();
        if (!_context.UserGalera.Any(ug => ug.GaleraId == galeraId && ug.UserId == userId))
            return Forbid();

        var userGalera = _context.UserGalera.FirstOrDefault(x => x.GaleraId == galeraId && x.UserId == memberId);
        if (userGalera == null)
        {
            return BadRequest("Usuário não pertence à galera");
        }
        _context.UserGalera.Remove(userGalera);

        _context.SaveChanges();
        return Ok();
    }

    [HttpGet("{id}")]
    public IActionResult GetGalera(int id)
    {
        var galera = _context.Galeras.FirstOrDefault(g => g.Id == id);
        if (galera == null) return NotFound();

        var members = _context.UserGalera
            .Where(ug => ug.GaleraId == id)
            .Select(ug => new ReadMemberDto
            {
                UserId = ug.UserId,
                Username = ug.User.UserName,
                DuelPoints = ug.DuelPoints
            })
            .ToList();

        return Ok(new { galera.Id, galera.Name, Members = members });
    }

    [HttpPost]
    public IActionResult AddGalera([FromBody] CreateGaleraDto galeraDto)
    {
        var userId = GetCurrentUserId();
        
        var galera = new Galera
        {
            Name = galeraDto.Name
        };
        _context.Galeras.Add(galera);
        _context.SaveChanges();

        // Automatically add creator as first member
        _context.UserGalera.Add(new UserGalera
        {
            UserId = userId,
            GaleraId = galera.Id,
            DuelPoints = 0
        });
        _context.SaveChanges();

        return Ok(galera);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Admin")] // Keep Admin for deletion for safety
    public IActionResult DeleteGalera(int id)
    {
        var galera = _context.Galeras.FirstOrDefault(
            galera => galera.Id == id);
        if (galera == null) return NotFound();
        
        // Remove associated members first
        var members = _context.UserGalera.Where(ug => ug.GaleraId == id);
        _context.UserGalera.RemoveRange(members);

        _context.Galeras.Remove(galera);
        _context.SaveChanges();
        return NoContent();
    }

    [HttpGet("{galeraId}/Collections")]
    public IActionResult GetCollections(int galeraId)
    {
        var userId = GetCurrentUserId();
        var userGalera = _context.UserGalera.FirstOrDefault(ug => ug.UserId == userId && ug.GaleraId == galeraId);
        int userPoints = userGalera?.DuelPoints ?? 0;

        var latestCollectionIds = _context.CardCollections.OrderByDescending(x => x.Id).Select(x => x.Id).Take(2).ToList();

        var collections = _context.GaleraCollections
            .Where(gc => gc.GaleraId == galeraId)
            .Select(gc => new {
                Id = gc.CardCollection.Id,
                Name = gc.CardCollection.Name,
                RemainingStock = _context.Cards.Where(c => c.CollectionId == gc.CardCollectionId).Sum(c => (int?)c.Quantity) ?? 0,
                Price = latestCollectionIds.Count > 0 && latestCollectionIds[0] == gc.CardCollectionId ? 3 :
                        latestCollectionIds.Count > 1 && latestCollectionIds[1] == gc.CardCollectionId ? 2 : 1,
                CoverImageUrl = _context.Cards
                    .Where(c => c.CollectionId == gc.CardCollectionId && c.Type == YGOApi.Data.Enums.CardType.MONSTER)
                    .OrderByDescending(c => c.Attack)
                    .Select(c => c.ImageUrl)
                    .FirstOrDefault() ?? _context.Cards
                        .Where(c => c.CollectionId == gc.CardCollectionId)
                        .Select(c => c.ImageUrl)
                        .FirstOrDefault()
            })
            .Distinct()
            .ToList();

        return Ok(new {
            UserPoints = userPoints,
            Collections = collections
        });
    }

    private int GetCurrentUserId()
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _context.Users.FirstOrDefault(x => x.UserName == userName)
            ?? throw new UnauthorizedAccessException("User not found");
        return user.Id;
    }
}