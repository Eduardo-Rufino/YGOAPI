using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.Contest;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize("Player")]
public class ContestController : ControllerBase
{
    private WriteContext _context;
    private IMapper _mapper;
    private static Random random = new Random();

    public ContestController(WriteContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("GetByGaleraId/{galeraId}")]
    public IActionResult GetContestsByGaleraId(int galeraId)
    {
        var contests = _context.Contests.Where(x => x.GaleraId == galeraId).ToList();
        if (contests == null || contests.Count == 0)
        {
            return NoContent();
        }

        return Ok(contests);
    }

    [HttpGet("{contestId}")]
    public IActionResult GetContest(int contestId)
    {
        var contest = _context.Contests.FirstOrDefault(x => x.Id == contestId);
        if (contest == null)
        {
            return NoContent();
        }

        var matches = _context.Matches.Where(x => x.ContestId == contestId).ToList();

        return Ok(new { contest, matches });
    }

    [HttpPost]
    [Authorize("Admin")]
    public IActionResult AddContest(CreateContestDto createContestDto)
    {
        Contest contest = _mapper.Map<Contest>(createContestDto);
        int? autoPassedPlayer = null;

        var players = _context.UserGalera
            .Where(x => x.GaleraId == contest.GaleraId)
            .Select(x => x.UserId)
            .ToList();

        if (players.Count < 2)
            return BadRequest("É necessário pelo menos 2 jogadores para criar uma competição.");

        if (createContestDto.Type == ContestType.TOURNAMENT){

            if (players.Count > 16)
                return BadRequest("O número máximo de jogadores para um torneio é 16.");

            if (players.Count % 2 != 0)
            {
                autoPassedPlayer = players[random.Next(0, players.Count - 1)];
                players.Remove(autoPassedPlayer.Value);
            }

            contest.CurrentStage = SetContestStage(players.Count);
        }

        _context.Contests.Add(contest);
        _context.SaveChanges();

        switch (contest.Type)
        {
            case ContestType.ROUND_ROBIN:
                for (int i = 0; i < players.Count; i++)
                {
                    for (int j = i + 1; j < players.Count; j++)
                    {
                        _context.Matches.Add(new Match()
                        {
                            ContestId = contest.Id,
                            Player1Id = players[i],
                            Player2Id = players[j],
                            Stage = ContestStage.GROUP
                        });
                    }
                }

                _context.SaveChanges();

                break;
            case ContestType.TOURNAMENT:
                foreach (var player in players)
                {
                    _context.Matches.Add(new Match()
                    {
                        ContestId = contest.Id,
                        Player1Id = player,
                        Player2Id = players.First(x => x != player),
                        Stage = contest.CurrentStage ?? throw new Exception("A fase atual do torneio não pode ser nula.")
                    });
                }

                if (autoPassedPlayer.HasValue)
                {
                    _context.Matches.Add(new Match()
                    {
                        ContestId = contest.Id,
                        Player1Id = autoPassedPlayer.Value,
                        Stage = GetNextStage(contest.CurrentStage)
                    });
                }

                _context.SaveChanges();

                break;
        }

        return Created(string.Empty, contest);
    }

    [HttpPost("Tournment/{tournmentId}/AdvancePhase")]
    [Authorize("Admin")]
    public IActionResult AddContest(int tournmentId)
    {
        Contest? contest = _context.Contests.FirstOrDefault(x => x.Id == tournmentId && x.Type == ContestType.TOURNAMENT);
        if (contest == null)
            return NotFound();

        var matches = _context.Matches.Where(x => x.ContestId == tournmentId && x.Stage == contest.CurrentStage).ToList();
        var winners = matches.Where(x => x.WinnerId.HasValue).Select(x => x.WinnerId ?? throw new Exception("Não é possível avançar de fase com partidas pendentes.")).ToList();

        contest.CurrentStage = GetNextStage(contest.CurrentStage);
        _context.Contests.Update(contest);

        for (int i = 0; i < winners.Count; i += 2)
        {
            _context.Matches.Add(new Match()
            {
                ContestId = tournmentId,
                Player1Id = winners[i],
                Player2Id = winners[i + 1],
                Stage = contest.CurrentStage.Value
            });
        }

        _context.SaveChanges();

        return Ok(new { contest, matches });
    }

    [HttpPost("{contestId}/Finish")]
    [Authorize("Admin")]
    public IActionResult FinishContest(int contestId, [FromQuery] int winnerId)
    {
        Contest? contest = _context.Contests.FirstOrDefault(x => x.Id == contestId);
        if (contest == null)
            return NotFound();

        contest.WinnerId = winnerId;
        contest.IsFinished = true;

        _context.Contests.Add(contest);
        _context.SaveChanges();

        return NoContent();
    }

    private static ContestStage SetContestStage(int count)
    {
        return count switch
        {
            2 => ContestStage.FINAL,
            4 => ContestStage.SEMI_FINALS,
            8 => ContestStage.QUARTER_FINALS,
            16 => ContestStage.ROUND_OF_SIXTEEN,
            _ => ContestStage.GROUP,
        };
    }

    private static ContestStage GetNextStage(ContestStage? stage)
    {
        if (stage == null)
            throw new Exception($"Não é possível avançar de fase sem definição");

        return stage switch
        {
            ContestStage.ROUND_OF_SIXTEEN => ContestStage.QUARTER_FINALS,
            ContestStage.QUARTER_FINALS => ContestStage.SEMI_FINALS,
            ContestStage.SEMI_FINALS => ContestStage.FINAL,
            _ => throw new Exception($"Não é possível avançar além da fase {stage.GetType()}"),
        };
    }
}