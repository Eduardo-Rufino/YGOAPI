using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YGOApi.Data;
using YGOApi.Data.Dtos.Card;
using YGOApi.Data.Dtos.Deck;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

[ApiController]
[Microsoft.AspNetCore.Mvc.Route("[controller]")]
public class DeckController : ControllerBase
{

    private CardContext _context;
    private IMapper _mapper;
    private ICardProvider _provider;

    public DeckController(CardContext context, IMapper mapper, ICardProvider provider)
    {
        _context = context;
        _mapper = mapper;
        _provider = provider;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public IActionResult AddDeck([FromBody] CreateDeckDto deckDto)
    {
        Decks deck = _mapper.Map<Decks>(deckDto);
        _context.Decks.Add(deck);
        _context.SaveChanges();
        return Created();
    }

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

    [HttpGet]
    public IEnumerable<ReadDeckDto> GetDeck([FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return _mapper.Map<List<ReadDeckDto>>(_context.Decks.Skip(skip).Take(take));
    }

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
