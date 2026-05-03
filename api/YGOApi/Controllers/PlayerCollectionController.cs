using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;
using YGOApi.Data;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.PlayerCollection;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controlador responsável por gerenciar a coleção de cartas de jogadores.
/// </summary>
/// <remarks>
/// Fornece endpoints para adicionar, atualizar e remover cartas da coleção de um jogador.
/// As operações persistem imediatamente usando o contexto de banco de dados (`CardContext`).
/// </remarks>
[ApiController]
[Route("[controller]")]
public class PlayerCollectionController : ControllerBase
{
    /// <summary>
    /// Contexto de acesso a dados para operações relacionadas a cartas e coleções.
    /// </summary>
    private CardContext _context;
    private IMapper _mapper;

    /// <summary>
    /// Inicializa uma nova instância de `PlayerCollectionController`.
    /// </summary>
    /// <param name="context">Instância de `CardContext` para acesso ao banco de dados.</param>
    public PlayerCollectionController(CardContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Adiciona ou atualiza cartas na coleção de um jogador.
    /// </summary>
    /// <param name="playerId">Identificador do jogador cuja coleção será modificada.</param>
    /// <param name="newCards">
    /// Lista de objetos `UpdatePlayerCollectionDto` especificando as cartas e quantidades a adicionar.
    /// </param>
    /// <returns>
    /// Resultado da operação contendo o número de cartas adicionadas e atualizadas:
    /// objeto `{ added, updated }`.
    /// </returns>
    /// <response code="201">Resposta de criação/atualização bem-sucedida (anotado via atributo, mas o método retorna 200 OK com detalhes).</response>
    /// <remarks>
    /// Comportamento:
    /// - Se uma carta já existir na coleção do jogador, sua `Quantity` é incrementada pela quantidade informada.
    /// - Se não existir, uma nova entrada de `PlayerCollection` é criada.
    /// - As alterações são persistidas chamando `_context.SaveChanges()`.
    /// </remarks>
    [HttpPost("Add/{playerId}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddCards(int playerId, [FromQuery]List<UpdatePlayerCollectionDto> newCards)
    {
        var cardsToUpdate = _context.PlayerCollections
            .Where(pc => pc.PlayerId == playerId && newCards.Select(c => c.CardId).Contains(pc.CardId))
            .ToList();

        var cardsToAdd = newCards.Except(cardsToUpdate.Select(c => new UpdatePlayerCollectionDto { CardId = c.CardId })).ToList();

        int added = 0, updated = 0;

        if (cardsToUpdate.Count > 0) 
        {
            List<UpdatePlayerCollectionDto> toUpdate = newCards.Where(c => cardsToUpdate.Any(ctu => ctu.CardId == c.CardId)).ToList();
            foreach (var card in toUpdate) 
            {
                var cardToUpdate = cardsToUpdate.FirstOrDefault(c => c.CardId == card.CardId);
                if (cardToUpdate != null) 
                {
                    cardToUpdate.Quantity += card.Quantity;
                    updated++;
                }
            }

            _context.PlayerCollections.UpdateRange(cardsToUpdate);
        }

        if(cardsToAdd.Count > 0) 
        {
            var toAdd = cardsToAdd.Select(card => new PlayerCollection
            {
                PlayerId = playerId,
                CardId = card.CardId,
                Quantity = card.Quantity
            }).ToList();
            _context.PlayerCollections.AddRange(toAdd);
            added += toAdd.Count;
        }
        
        _context.SaveChanges();

        return Ok(new { added, updated });
    }

    /// <summary>
    /// Remove ou decrementa quantidades de cartas da coleção de um jogador.
    /// </summary>
    /// <param name="playerId">Identificador do jogador cuja coleção será modificada.</param>
    /// <param name="cardsToRemove">
    /// Lista de `UpdatePlayerCollectionDto` indicando as cartas e quantidades a serem removidas.
    /// Deve ser enviada via query string.
    /// </param>
    /// <returns>
    /// Objeto contendo o número de entradas removidas e atualizadas: `{ removed, updated }`.
    /// </returns>
    /// <response code="201">Anotação de resposta (o método retorna 200 OK com detalhes do processamento).</response>
    /// <remarks>
    /// Comportamento:
    /// - Para cada carta solicitada, se a quantidade resultante após subtração for maior que zero, o registro é atualizado com a nova quantidade.
    /// - Caso contrário, o registro é removido da tabela `PlayerCollections`.
    /// - As alterações são persistidas com `_context.SaveChanges()`.
    /// </remarks>
    [HttpPost("Remove/{playerId}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult RemoveCards(int playerId, [FromQuery] List<UpdatePlayerCollectionDto> cardsToRemove)
    {
        var cardsToUpdate = _context.PlayerCollections
            .Where(pc => pc.PlayerId == playerId && cardsToRemove.Select(c => c.CardId).Contains(pc.CardId))
            .ToList();        

        int removed = 0, updated = 0;

        if (cardsToUpdate.Count > 0)
        {
            List<PlayerCollection> toUpdate = new List<PlayerCollection>();
            List<PlayerCollection> toRemove = new List<PlayerCollection>();

            toUpdate = cardsToUpdate.Where(c => cardsToRemove.Any(ctr => ctr.CardId == c.CardId && c.Quantity - ctr.Quantity > 0)).ToList();
            toRemove = cardsToUpdate.Except(toUpdate).ToList();

            foreach (var card in toUpdate)
            {
                var cardToUpdate = cardsToRemove.FirstOrDefault(c => c.CardId == card.CardId);
                if (cardToUpdate != null)
                {
                    card.Quantity -= cardToUpdate.Quantity;
                    updated++;
                }
                _context.UpdateRange(toUpdate);
            }

            if (toRemove.Count > 0)
            {
                _context.PlayerCollections.RemoveRange(toRemove);
                removed += toRemove.Count;
            }

            _context.SaveChanges();
        }            

        return Ok(new { removed, updated });
    }

    [HttpGet]
    public IEnumerable<ReadPlayerCollectionDto> GetPlayerCollection([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadPlayerCollectionDto>>(_context.PlayerCollections.Skip(skip).Take(take));
    }

    [HttpGet("{playerId}")]
    public IEnumerable<ReadPlayerCollectionDto> GetPlayerCollectionByPlayerId(int playerId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadPlayerCollectionDto>>(
            _context.PlayerCollections
                .Where(pc => pc.PlayerId == playerId)
                .Skip(skip)
                .Take(take)
                .ToList()
        );
    }
}

