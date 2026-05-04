using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controlador responsável por operações CRUD relacionadas a decks e suas cartas.
/// Expondo endpoints para criação, leitura, atualização (deck e cards do deck) e deleção.
/// </summary>
[ApiController]
[Route("[controller]")]
public class DeckController : ControllerBase
{

    /// <summary>
    /// Contexto do banco de dados para acesso às entidades relacionadas a cards e decks.
    /// </summary>
    private CardContext _context;
    /// <summary>
    /// Mapper utilizado para converter entre DTOs e entidades do domínio.
    /// </summary>
    private IMapper _mapper;
    /// <summary>
    /// Provedor externo/opcional de cards (injetado para cenários que necessitem dele).
    /// </summary>
    private ICardProvider _provider;

    /// <summary>
    /// Construtor do controlador que recebe dependências via injeção.
    /// </summary>
    /// <param name="context">Instância de <see cref="CardContext"/> para acesso a dados.</param>
    /// <param name="mapper">Instância de <see cref="IMapper"/> para mapeamentos entre DTOs e entidades.</param>
    /// <param name="provider">Instância de <see cref="ICardProvider"/> para operações relacionadas a cards (opcional).</param>
    public DeckController(CardContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
        _provider = provider;
    }

    /// <summary>
    /// Cria um novo deck a partir de um DTO.
    /// </summary>
    /// <param name="deckDto">DTO contendo os dados necessários para criação do deck.</param>
    /// <returns>
    /// Retorna <see cref="CreatedResult"/> (HTTP 201) quando o deck é criado com sucesso.
    /// </returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddDeck([FromBody] CreateDeckDto deckDto)
    {
        Decks deck = _mapper.Map<Decks>(deckDto);
        _context.Decks.Add(deck);
        _context.SaveChanges();
        return Created(string.Empty, deck);
    }

    /// <summary>
    /// Atualiza as cartas associadas a um deck substituindo a lista atual pelas fornecidas.
    /// </summary>
    /// <param name="deckId">Identificador do deck a ser atualizado.</param>
    /// <param name="cardsOnDeck">Lista de DTOs contendo <c>CardId</c> e <c>Quantity</c> para o deck.</param>
    /// <remarks>
    /// O método remove todas as entradas atuais de <c>DeckCards</c> para o deck informado
    /// e adiciona as novas entradas presentes em <paramref name="cardsOnDeck"/>. Retorna 200 OK.
    /// </remarks>
    [HttpPatch("UpdateCardsOnDeck/{deckId}")]
    public IActionResult UpdateCardsOnDeck(int deckId, [FromBody] List<UpdateCardDeckDto> cardsOnDeck) 
    {
        var deckListDb = _context.DeckCards.Where(x => x.DeckId == deckId).ToList();

        _context.DeckCards.RemoveRange(deckListDb);

        List<DeckCard> cardsToAdd = cardsOnDeck
            .Select(cardDeck => new DeckCard
            {
                DeckId = deckId,
                CardId = cardDeck.CardId,
                Quantity = cardDeck.Quantity
            })
            .ToList();        

        if (cardsToAdd.Count > 0) 
        {
            _context.DeckCards.AddRange(cardsToAdd);
        }

        _context.SaveChanges();

        return Ok();
    }

    /// <summary>
    /// Recupera uma página de decks.
    /// </summary>
    /// <param name="skip">Quantidade de itens a pular (offset). Padrão: 0.</param>
    /// <param name="take">Quantidade máxima de itens a retornar. Padrão: 50.</param>
    /// <returns>Lista de <see cref="ReadDeckDto"/> representando decks paginados.</returns>
    [HttpGet]
    [Authorize(Policy = "Player")]
    public IEnumerable<ReadDeckDto> GetDeck([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _context.User.Where(x => x.UserName == userName).FirstOrDefault()
            ?? throw new UnauthorizedAccessException("User not found");        
        return _mapper.Map<List<ReadDeckDto>>(_context.Decks.Include(x => x.DeckCards).Where(x => x.UserId == user.Id).Skip(skip).Take(take));
    }

    /// <summary>
    /// Recupera a lista de cartas (e informações relacionadas) pertencentes a um deck específico.
    /// </summary>
    /// <param name="deckId">Identificador do deck.</param>
    /// <returns>
    /// 200 OK com a lista de <see cref="ReadDeckCardDto"/> quando encontrar itens;
    /// 404 NotFound quando o deck não existir ou não possuir cartas.
    /// </returns>
    [HttpGet("{deckId}")]
    public IActionResult GetDeckCardListbyDeckID(int deckId)
    {
        var deck = _context.DeckCards
            .Where(x => x.DeckId == deckId)
            .Select(x => new ReadDeckCardDto()
            {
                CardId = x.CardId,
                Attack = x.Card.Attack,
                Defense = x.Card.Defense,
                CardName = x.Card.Name,
                DeckName = x.Deck.Name,
                ImageUrl = x.Card.ImageUrl,
                Quantity = x.Quantity
            })
            .ToList();
        if (deck == null || deck.Count == 0) return NotFound();
        return Ok(deck);
    }

    /// <summary>
    /// Atualiza metadados de um deck existente com os valores fornecidos no DTO.
    /// </summary>
    /// <param name="id">Identificador do deck a ser atualizado.</param>
    /// <param name="deckDto">DTO com valores a serem aplicados no deck.</param>
    /// <returns>
    /// 204 NoContent quando a atualização for bem-sucedida;
    /// 404 NotFound quando o deck não existir.
    /// </returns>
    [HttpPut("{id}")]
    public IActionResult UpdateDeck(int id, [FromBody] UpdateDeckDto deckDto)
    {
        var deck = _context.Decks.FirstOrDefault(
            deck => deck.Id == id);
        if(deck == null) return NotFound();
        _mapper.Map(deckDto, deck);
        _context.SaveChanges();
        return NoContent();
    }

    /// <summary>
    /// Remove um deck e todas as associações de cartas relacionadas a ele.
    /// </summary>
    /// <param name="id">Identificador do deck a ser removido.</param>
    /// <returns>
    /// 204 NoContent quando a deleção for concluída;
    /// 404 NotFound quando o deck não existir.
    /// </returns>
    [HttpDelete("{id}")]
    public IActionResult DeleteDeck(int id)
    {
        var deck = _context.Decks.FirstOrDefault(
            deck => deck.Id == id);
        if (deck == null) return NotFound();

        _context.DeckCards.RemoveRange(_context.DeckCards.Where(x => x.DeckId == id));

        _context.Remove(deck);
        _context.SaveChanges();
        return NoContent();
    }
}

