using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.User;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controller para operações relacionadas a usuários e ao gerenciamento de cartas em decks.
/// </summary>
/// <remarks>
/// Expõe endpoints para criar, listar, atualizar e remover usuários, além de atualizar e consultar
/// a lista de cartas de um deck específico.
/// </remarks>
[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private CardContext _context;
    private IMapper _mapper;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="UserController"/>.
    /// </summary>
    /// <param name="context">Contexto do banco de dados (<see cref="CardContext"/>).</param>
    /// <param name="mapper">Instância do AutoMapper para conversões entre DTOs e entidades.</param>
    /// <param name="provider">Provedor de cartas (injetado, não utilizado nesta implementação).</param>
    public UserController(CardContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Adiciona um novo usuário ao sistema.
    /// </summary>
    /// <param name="userDto">DTO contendo os dados necessários para criar o usuário (<see cref="CreateUserDto"/>).</param>
    /// <returns>Retorna 201 Created com o usuário criado no corpo da resposta.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddUser([FromBody] CreateUserDto userDto)
    {
        User user = _mapper.Map<User>(userDto);
        _context.User.Add(user);
        _context.SaveChanges();
        return Created(string.Empty, user);
    }

    /// <summary>
    /// Substitui a lista de cartas associadas a um deck.
    /// </summary>
    /// <param name="deckId">Identificador do deck a ser atualizado.</param>
    /// <param name="cardsOnDeck">Lista de DTOs contendo o id da carta e a quantidade desejada no deck (<see cref="UpdateCardDeckDto"/>).</param>
    /// <remarks>
    /// O comportamento aplicado é:
    /// 1. Remove todas as entradas atuais de cartas do deck identificado por <paramref name="deckId"/>.
    /// 2. Insere as entradas providas em <paramref name="cardsOnDeck"/> (se houver).
    /// </remarks>
    /// <returns>Retorna 200 OK ao finalizar a operação.</returns>
    [HttpPatch("UpdateCardsOnDeck/{deckId}")]
    public IActionResult UpdatePlayerCards(int deckId, [FromBody] List<UpdateCardDeckDto> cardsOnDeck) 
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
    /// Retorna uma lista paginada de usuários.
    /// </summary>
    /// <param name="skip">Número de registros a pular (padrão 0).</param>
    /// <param name="take">Número máximo de registros a retornar (padrão 50).</param>
    /// <returns>Lista de <see cref="ReadUserDto"/> mapeada a partir das entidades <see cref="User"/>.</returns>
    [HttpGet]
    public IEnumerable<ReadUserDto> GetUser([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadUserDto>>(_context.User.Skip(skip).Take(take));
    }

    /// <summary>
    /// Obtém a lista de cartas de um deck pelo seu identificador.
    /// </summary>
    /// <param name="deckId">Identificador do deck.</param>
    /// <returns>
    /// 200 OK com uma lista de <see cref="ReadDeckCardDto"/> quando existirem cartas;
    /// 404 NotFound quando não houver registros para o deck informado.
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
    /// Atualiza os dados de um usuário existente.
    /// </summary>
    /// <param name="id">Identificador do usuário a ser atualizado.</param>
    /// <param name="userDto">DTO com os campos a serem atualizados (<see cref="UpdateUserDto"/>).</param>
    /// <returns>204 NoContent em caso de sucesso; 404 NotFound se o usuário não for encontrado.</returns>
    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] UpdateUserDto userDto)
    {
        var user = _context.User.FirstOrDefault(
            user => user.Id == id);
        if(user == null) return NotFound();
        _mapper.Map(userDto, user);
        _context.SaveChanges();
        return NoContent();
    }

    /// <summary>
    /// Remove um usuário e entradas relacionadas de cartas em decks (conforme implementação atual).
    /// </summary>
    /// <param name="id">Identificador do usuário a remover.</param>
    /// <remarks>
    /// A implementação atual remove as entradas de <see cref="DeckCard"/> onde <c>DeckId == id</c> antes de excluir o usuário.
    /// </remarks>
    /// <returns>204 NoContent em caso de sucesso; 404 NotFound se o usuário não existir.</returns>
    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _context.User.FirstOrDefault(
            user => user.Id == id);
        if (user == null) return NotFound();
        _context.DeckCards.RemoveRange(_context.DeckCards.Where(x => x.DeckId == id));

        _context.Remove(user);
        _context.SaveChanges();
        return NoContent();
    }
}

