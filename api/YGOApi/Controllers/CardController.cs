using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.Card;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controlador responsável por operações CRUD sobre a entidade de carta.
/// Fornece endpoints para criar, recuperar (lista/por id), atualizar e remover cartas.
/// </summary>
[ApiController]
[Route("[controller]")]
public class CardController : ControllerBase
{

    private CardContext _context;
    private IMapper _mapper;
    private ICardProvider _provider;

    /// <summary>
    /// Inicializa uma nova instância de <see cref="CardController"/>.
    /// </summary>
    /// <param name="context">Contexto do banco de dados usado para persistência de cartas.</param>
    /// <param name="mapper">Instância de <see cref="IMapper"/> para conversão entre entidades e DTOs.</param>
    /// <param name="provider">Provedor externo de cartas (injetado para futuras integrações).</param>
    public CardController(CardContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
        _provider = provider;
    }

    /// <summary>
    /// Cria uma nova carta e persiste no banco de dados.
    /// </summary>
    /// <param name="cardDto">DTO com os dados necessários para criar a carta.</param>
    /// <response code="201">Inserção realizada com sucesso.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddCard([FromBody] CreateCardDto cardDto)
    {
        Card card = _mapper.Map<Card>(cardDto);
        _context.Cards.Add(card);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetCardbyID), new { id = card.Id}, card);
    }

    /// <summary>
    /// Recupera uma lista paginada de cartas.
    /// </summary>
    /// <param name="skip">Quantidade de itens a pular (offset). Padrão = 0.</param>
    /// <param name="take">Quantidade máxima de itens a retornar. Padrão = 50.</param>
    /// <returns>Lista de <see cref="ReadCardDto"/> representando as cartas.</returns>
    [HttpGet]
    public IEnumerable<ReadCardDto> GetCard([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadCardDto>>(_context.Cards.Skip(skip).Take(take));
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
    /// Atualiza os campos de uma carta existente.
    /// </summary>
    /// <param name="id">Identificador da carta a ser atualizada.</param>
    /// <param name="cardDto">DTO contendo os campos a atualizar.</param>
    /// <returns>204 quando a atualização for bem-sucedida; 404 se a carta não existir.</returns>
    [HttpPut("{id}")]
    public IActionResult UpdateCard(int id, [FromBody] UpdateCardDto cardDto)
    {
        var card = _context.Cards.FirstOrDefault(
            card => card.Id == id);
        if(card == null) return NotFound();
        _mapper.Map(cardDto, card);
        _context.SaveChanges();
        return NoContent();
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
