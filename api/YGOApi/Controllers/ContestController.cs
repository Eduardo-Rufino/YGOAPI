using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.Contest;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
//TODO: Adicionar [Autorize("Player")] após testes
public class ContestController : ControllerBase
{
    private WriteContext _context;
    private IMapper _mapper;

    public ContestController(WriteContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("{galeraId}")]
    public IActionResult GetContestsByGaleraId(int galeraId)
    {
        var contest = _context.Contests.Where(x => x.GaleraId == galeraId).ToList();
        if (contest == null || contest.Count == 0)
        {
            return NoContent();
        }

        return Ok(contest);
    }

    [HttpPost]
    //TODO: Adicionar [Autorize("Admin")]
    public IActionResult AddContest(CreateContestDto createContestDto)
    {
        Contest contest = _mapper.Map<Contest>(createContestDto);

        _context.Contests.Add(contest);
        _context.SaveChanges();

        var players = _context.UserGalera
            .Where(x => x.GaleraId == contest.GaleraId)
            .Select(x => x.UserId)
            .ToList();

        switch (contest.Type)
        {
            case Data.Enums.ContestType.ROUND_ROBIN:
                for (int i = 0; i < players.Count; i++)
                {
                    for (int j = i + 1; j < players.Count; j++)
                    {
                        _context.Matches.Add(new Match()
                        {
                            ContestId = contest.Id,
                            Player1Id = players[i],
                            Player2Id = players[j],
                            Stage = Data.Enums.ContestStage.GROUP
                        });
                    }
                }

                _context.SaveChanges();

                break;
            case Data.Enums.ContestType.TOURNAMENT:
                //TODO: pendente implementação
                break;
        }

        return Created(string.Empty, contest);
    }
}