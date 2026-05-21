using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize("Player")]
public class MatchController : ControllerBase
{
    private WriteContext _context;

    public MatchController(WriteContext context)
    {
        _context = context;
    }

    [HttpPatch("{matchId}/SetWinner")]
    public IActionResult SetWinner(int matchId, [FromQuery]int winnerUserId)
    {
        Match? match = _context.Matches.FirstOrDefault(x => x.Id == matchId);
        if (match == null)
            return NotFound();

        if (match.Player1Id != winnerUserId && match.Player2Id != winnerUserId)
            return BadRequest("O usuário vencedor deve ser um dos jogadores da partida");

        if (match.WinnerId != null)
        {
            UserGalera? exWinner = _context.UserGalera.FirstOrDefault(x => x.UserId == match.WinnerId)
            ?? throw new Exception("Usuário não encontrado");

            exWinner.DuelPoints -= 1;

            _context.Update(exWinner);
        }

        match.WinnerId = winnerUserId;

        _context.Matches.Update(match);

        UserGalera? winner = _context.UserGalera.FirstOrDefault(x => x.UserId == winnerUserId) 
            ?? throw new Exception("Usuário não encontrado");

        winner.DuelPoints += 1;

        _context.Update(winner);

        _context.SaveChanges();

        return NoContent();
    }
}