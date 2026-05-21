using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.Banlist;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
//TODO: Adicionar [Autorize("Admin")]
public class BanlistController : ControllerBase
{
    private WriteContext _context;

    public BanlistController(WriteContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetBanlists()
    {
        var banlists = _context.Banlists.Select(b => new { b.Id, b.Name }).ToList();
        return Ok(banlists);
    }

    [HttpGet("{id}")]
    public IActionResult GetBanlist(int id)
    {
        var banlist = _context.Banlists.FirstOrDefault(x => x.Id == id);
        if (banlist == null) return NotFound();

        var dto = new BanlisttDto
        {
            Name = banlist.Name,
            Banlist = new List<CardLimitation>()
        };

        if (!string.IsNullOrEmpty(banlist.ForbiddenCardsIds))
            foreach (var cid in banlist.ForbiddenCardsIds.Split(','))
                if (int.TryParse(cid, out int parsed))
                    dto.Banlist.Add(new CardLimitation { CardId = parsed, Status = Data.Enums.CardBanStatus.BANNED });

        if (!string.IsNullOrEmpty(banlist.LimitedCardsIds))
            foreach (var cid in banlist.LimitedCardsIds.Split(','))
                if (int.TryParse(cid, out int parsed))
                    dto.Banlist.Add(new CardLimitation { CardId = parsed, Status = Data.Enums.CardBanStatus.LIMITED });

        if (!string.IsNullOrEmpty(banlist.SemiLimitedCardsIds))
            foreach (var cid in banlist.SemiLimitedCardsIds.Split(','))
                if (int.TryParse(cid, out int parsed))
                    dto.Banlist.Add(new CardLimitation { CardId = parsed, Status = Data.Enums.CardBanStatus.SEMI_LIMITED });

        return Ok(dto);
    }

    [HttpPost]
    public IActionResult AddBanlist(BanlisttDto createContestDto)
    {
        string? forbiddenCards = string.Join(',',createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.BANNED)
            .Select(x => x.CardId));

        string? limitedCards = string.Join(',', createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.LIMITED)
            .Select(x => x.CardId));

        string? semiLimitedCards = string.Join(',', createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.SEMI_LIMITED)
            .Select(x => x.CardId));

        Banlist banlist = new Banlist()
        {
            Name = createContestDto.Name,
            ForbiddenCardsIds = forbiddenCards,
            LimitedCardsIds = limitedCards,
            SemiLimitedCardsIds = semiLimitedCards
        };
        
        _context.Banlists.Add(banlist);
        _context.SaveChanges();

        return Created(string.Empty, banlist);
    }

    [HttpPost("Edit/{banlistId}")]
    public IActionResult EditBanlist(int banlistId, BanlisttDto createContestDto)
    {
        var banlist = _context.Banlists.FirstOrDefault(x => x.Id == banlistId);
        if (banlist == null)
            return NotFound();

        string? forbiddenCards = string.Join(',', createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.BANNED)
            .Select(x => x.CardId));

        string? limitedCards = string.Join(',', createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.LIMITED)
            .Select(x => x.CardId));

        string? semiLimitedCards = string.Join(',', createContestDto.Banlist
            .Where(x => x.Status == Data.Enums.CardBanStatus.SEMI_LIMITED)
            .Select(x => x.CardId));

        banlist.Name = createContestDto.Name;
        banlist.ForbiddenCardsIds = forbiddenCards;
        banlist.LimitedCardsIds = limitedCards;
        banlist.SemiLimitedCardsIds = semiLimitedCards;

        _context.Banlists.Update(banlist);
        _context.SaveChanges();

        return Created(string.Empty, banlist);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteDeck(int id)
    {
        var banlist = _context.Banlists.FirstOrDefault(x => x.Id == id);
        if (banlist == null) 
            return NotFound();

        _context.Remove(banlist);
        _context.SaveChanges();

        return NoContent();
    }
}