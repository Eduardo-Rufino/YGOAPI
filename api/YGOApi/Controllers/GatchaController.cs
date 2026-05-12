using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Models;

namespace YGOApi.Controllers;

public class GatchaController : ControllerBase
{
    private WriteContext _context;
    private static Random random = new Random();

    public GatchaController(WriteContext context)
    {
        _context = context;
    }

    [HttpGet("OpenBox/{collectionId}")]
    public IActionResult OpenBox(int collectionId, [FromQuery] int boosterQuantity = 24)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        User? user = _context.Users.FirstOrDefault(x => x.UserName == userName)
            ?? throw new UnauthorizedAccessException("User not found");

        var collection = _context.CardCollections.FirstOrDefault(x => x.Id == collectionId);
        if (collection == null)
        {
            return BadRequest("A coleção citada não existe");
        }

        var cardsToSort = _context.Cards.Where(x => x.CollectionId == collectionId).ToList();
        var sortedCards = SortCards(cardsToSort, boosterQuantity * 9);

        return Ok(collection);
    }

    //TODO: Ainda não funciona
    //[HttpGet("OpenBooster/{collectionId}")]
    //public IActionResult OpenBooster(int collectionId)
    //{
    //    var collection = _context.CardCollections.FirstOrDefault(x => x.Id == collectionId);
    //    if (collection == null)
    //    {
    //        return BadRequest("A coleção citada não existe");
    //    }

    //    var cardsToSort = _context.Cards.Where(x => x.CollectionId == collectionId && x.Quantity > 0).ToList();
    //    var sortedCards = SortCards(cardsToSort, 9);

    //    return Ok(collection);
    //}

    private static List<Card> SortCards(List<Card> cards, int returnQuantity)
    {
        List<Card> result = new List<Card>();

        for (int i = 0; i < returnQuantity; i++)
        {
            int weight = cards.Sum(x => x.Quantity);

            int sorted = random.Next(1, weight + 1);

            int total = 0;

            foreach (var card in cards)
            {
                total += card.Quantity;

                if (sorted <= total)
                {
                    result.Add(card);
                    break;
                }
            }
        }

        return result;
    }
}