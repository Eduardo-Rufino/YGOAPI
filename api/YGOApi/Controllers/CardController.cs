using AutoMapper;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using YGOApi.Data;
using YGOApi.Data.Dtos;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Microsoft.AspNetCore.Mvc.Route("[controller]")]
public class CardController : ControllerBase
{

    private CardContext _context;
    private IMapper _mapper;
    private ICardProvider _provider;

    public CardController(CardContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
        _provider = provider;
    }

    /// <summary>
    /// Adiciona um filme ao banco de dados
    /// </summary>
    /// <param name="cardDto">Objeto com os campos necessários para a criação de um filme</param>
    /// <returns>IActionResult</returns>
    /// <response code="201">Caso de inserção seja feita com sucesso</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddCard([FromBody] CreateCardDto cardDto)
    {
        Card card = _mapper.Map<Card>(cardDto);
        _context.Cards.Add(card);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetCardbyID), new { id = card.Id}, card);
    }

    [HttpGet]
    public IEnumerable<ReadCardDto> GetCard([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadCardDto>>(_context.Cards.Skip(skip).Take(take));
    }

    [HttpGet("{id}")]
    public IActionResult GetCardbyID(int id)
    {
        var card = _context.Cards.FirstOrDefault(card => card.Id == id);
        if (card == null) return NotFound();
        var cardDto = _mapper.Map<ReadCardDto>(card);
        return Ok(cardDto);
    }

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

    [HttpPatch("{id}")]
    public IActionResult UpdateCardPatch(int id, JsonPatchDocument<UpdateCardDto> patch)
    {
        var card = _context.Cards.FirstOrDefault(
            card => card.Id == id);
        if (card == null) return NotFound();

        var cardParaAtualizar = _mapper.Map<UpdateCardDto>(card);

        patch.ApplyTo(cardParaAtualizar, ModelState);

        if(!TryValidateModel(cardParaAtualizar))
        {
            return ValidationProblem(ModelState);
        }
        _mapper.Map(cardParaAtualizar, card);
        _context.SaveChanges();
        return NoContent();
    }

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


    [HttpGet("Provider/{collectionName}")]
    public async Task<IActionResult> GetCardByProviderCollection(string collectionName)
    {
        var response = await _provider.ListCardByCollection(collectionName);
        
        return Ok(response);
    }

    [HttpPost("Provider/AddCardProvider")]
    public IActionResult AddCardsProvider([FromBody] List<YgoProDeckCardDto> cardList)
    {
        List<Card> cards = new List<Card>();

        foreach (var card in cardList)
        { 
            var c = CardFactory.CreateCardFromYgoProDeckDto(card);
            cards.Add(c);
        }
        _context.Cards.AddRange(cards);
        _context.SaveChanges();
        return NoContent();
    }
}
