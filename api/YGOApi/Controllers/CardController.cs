using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.Card;
using YGOApi.Data.Enums;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controlador responsável por operações CRUD sobre a entidade de carta.
/// Fornece endpoints para criar, recuperar (lista/por id), atualizar e remover cartas.
/// </summary>
[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Player")]
public class CardController : ControllerBase
{
    private WriteContext _context;
    private IMapper _mapper;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="CardController"/>.
    /// </summary>
    /// <param name="context">Contexto do banco de dados usado para persistência de cartas.</param>
    /// <param name="mapper">Instância de <see cref="IMapper"/> para conversão entre entidades e DTOs.</param>
    public CardController(WriteContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Recupera uma lista paginada de cartas.
    /// </summary>
    /// <param name="skip">Quantidade de itens a pular (offset). Padrão = 0.</param>
    /// <param name="take">Quantidade máxima de itens a retornar. Padrão = 50.</param>
    /// <returns>Lista de <see cref="ReadCardDto"/> representando as cartas.</returns>
    [HttpGet]
    public IEnumerable<ReadCardResponseDto> GetCard([FromQuery] int skip = 0, [FromQuery] int take = 50, [FromQuery] int? userId = null, [FromQuery] int? galeraId = null)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _context.Users.Where(x => x.UserName == userName).FirstOrDefault()
            ?? throw new UnauthorizedAccessException("User not found");
        int playerId = userId ?? user.Id;

        // Load active banlist if galera is provided
        HashSet<string> forbidden = new HashSet<string>();
        HashSet<string> limited = new HashSet<string>();
        HashSet<string> semiLimited = new HashSet<string>();

        if (galeraId.HasValue)
        {
            var galera = _context.Galeras.Include(g => g.ActiveBanlist).FirstOrDefault(g => g.Id == galeraId.Value);
            if (galera?.ActiveBanlist != null)
            {
                if (!string.IsNullOrEmpty(galera.ActiveBanlist.ForbiddenCardsIds))
                    foreach(var id in galera.ActiveBanlist.ForbiddenCardsIds.Split(',')) forbidden.Add(id);
                if (!string.IsNullOrEmpty(galera.ActiveBanlist.LimitedCardsIds))
                    foreach(var id in galera.ActiveBanlist.LimitedCardsIds.Split(',')) limited.Add(id);
                if (!string.IsNullOrEmpty(galera.ActiveBanlist.SemiLimitedCardsIds))
                    foreach(var id in galera.ActiveBanlist.SemiLimitedCardsIds.Split(',')) semiLimited.Add(id);
            }
        }

        // Join Player Quantities
        var playerQuantities = _context.PlayerCollections
            .Where(pc => pc.PlayerId == playerId)
            .Select(pc => new { pc.CardId, pc.Quantity });

        var cardWithQuantities = _context.Cards
            .GroupJoin(playerQuantities,
                c => c.Id,
                pq => pq.CardId,
                (c, pqGroup) => new { Card = c, Qty = pqGroup.Sum(x => x.Quantity) });

        var groupedStats = cardWithQuantities
            .GroupBy(x => x.Card.Passcode)
            .Select(g => new
            {
                Passcode = g.Key,
                TotalQuantity = g.Sum(x => x.Qty),
                RepresentativeCardId = g.Min(x => x.Card.Id)
            });

        var query = from stat in groupedStats
                    join c in _context.Cards on stat.RepresentativeCardId equals c.Id
                    orderby stat.TotalQuantity > 0 descending, c.Name
                    select new ReadCardResponseDto
                    {
                        Attack = c.Attack,
                        Attribute = c.Attribute,
                        Defense = c.Defense,
                        Archetype = c.Archetype,
                        Effect = c.Effect,
                        CollectionId = c.CollectionId,
                        Collection = c.CardCollection.Name,
                        BanStatus = CardBanStatus.UNLIMITED, // Default
                        Id = c.Id,
                        ImageUrl = c.ImageUrlSmall,
                        ImageUrlSmall = c.ImageUrlSmall,
                        Level = c.Level,
                        LinkMarkers = c.LinkMarkers,
                        LinkRating = c.LinkRating,
                        Name = c.Name,
                        PendulumScale = c.PendulumScale,
                        Race = c.Race,
                        SubType = c.SubType,
                        Type = c.Type,
                        Passcode = c.Passcode,
                        HoraDaConsulta = DateTime.Now,
                        HasCard = stat.TotalQuantity > 0,
                        Quantity = stat.TotalQuantity
                    };

        var resultado = query.Skip(skip).Take(take).ToList();

        // Map ban status dynamically
        if (galeraId.HasValue)
        {
            foreach (var r in resultado)
            {
                string idStr = r.Id.ToString();
                if (forbidden.Contains(idStr))
                    r.BanStatus = CardBanStatus.BANNED;
                else if (limited.Contains(idStr))
                    r.BanStatus = CardBanStatus.LIMITED;
                else if (semiLimited.Contains(idStr))
                    r.BanStatus = CardBanStatus.SEMI_LIMITED;
            }
        }

        return resultado;
    }

    /// <summary>
    /// Recupera uma carta por identificador.
    /// </summary>
    /// <param name="id">Identificador da carta.</param>
    /// <returns>200 com <see cref="ReadCardDto"/> se encontrada; 404 caso contrário.</returns>
    [HttpGet("{id}")]
    public IActionResult GetCardbyID(int id)
    {
        var card = _context.Cards.FirstOrDefault(card => card.Id == id);
        if (card == null) return NotFound();
        var cardDto = _mapper.Map<ReadCardDto>(card);
        return Ok(cardDto);
    }

    /// <summary>
    /// Remove uma carta pelo identificador.
    /// </summary>
    /// <param name="id">Identificador da carta a ser removida.</param>
    /// <returns>204 quando a remoção for bem-sucedida; 404 se a carta não existir.</returns>
    [HttpDelete("{id}")]
    public IActionResult DeleteCard(int id)
    {
        var card = _context.Cards.FirstOrDefault(
            card => card.Id == id);
        if (card == null) return NotFound();
        _context.Remove(card);
        _context.SaveChanges();
        return NoContent();
    }
}