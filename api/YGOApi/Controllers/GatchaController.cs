using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using YGOApi.Data;
using YGOApi.Data.Dtos.PlayerCollection;
using YGOApi.Data.Enums;
using YGOApi.Models;
using YGOApi.Services.Gatcha;
using YGOApi.Services.PlayerCollection;
using YGOApi.Data.Dtos.Card;

namespace YGOApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Player")]
public class GatchaController : ControllerBase
{
    private WriteContext _context;
    private IPlayerCollectionService _playerCollectionService;
    private IGatchaService _gatchaService;
    private IMapper _mapper;
    private static Random random = new Random();

    public GatchaController(WriteContext context, IPlayerCollectionService playerCollectionService, IGatchaService gatchaService, IMapper mapper)
    {
        _context = context;
        _playerCollectionService = playerCollectionService;
        _gatchaService = gatchaService;
        _mapper = mapper;
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

        if (cardsToSort.Count == 0)
        {
            return BadRequest("Esta coleção não possui cartas.");
        }

        // Para OpenBox, usamos o peso baseado em raridade e não decrementamos o banco
        var sortedCards = SortCards(cardsToSort, boosterQuantity * 9, useCardQuantity: false);

        // Persistir na coleção do jogador
        _playerCollectionService.AddCards(user.Id, sortedCards.Select(c => new UpdatePlayerCollectionDto { CardId = c.Id, Quantity = 1 }).ToList());

        var resultDtos = _mapper.Map<List<ReadCardResponseDto>>(sortedCards);
        return Ok(resultDtos);
    }
        
    [HttpGet("OpenBooster/{collectionId}/{galeraId}")]
    public IActionResult OpenBooster(int collectionId, int galeraId)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        User? user = _context.Users.FirstOrDefault(x => x.UserName == userName)
            ?? throw new UnauthorizedAccessException("User not found");

        var collection = _context.CardCollections.FirstOrDefault(x => x.Id == collectionId);
        if (collection == null)
        {
            return BadRequest("A coleção citada não existe");
        }

        // Buscar os pontos do usuário nesta galera específica
        var userGalera = _context.UserGalera.FirstOrDefault(ug => ug.UserId == user.Id && ug.GaleraId == galeraId);
        if (userGalera == null)
        {
            return BadRequest("O usuário não faz parte desta Galera.");
        }

        // Determinar o preço do booster
        var latestCollections = _context.CardCollections.OrderByDescending(x => x.Id).Take(2).ToList();
        int price = 1;
        if (latestCollections.Count > 0 && latestCollections[0].Id == collectionId) price = 3;
        else if (latestCollections.Count > 1 && latestCollections[1].Id == collectionId) price = 2;

        if (userGalera.DuelPoints < price)
        {
            return BadRequest($"Você não possui pontos suficientes nesta Galera. Preço: {price}, Saldo: {userGalera.DuelPoints}");
        }

        var cardsToSort = _context.Cards.Where(x => x.CollectionId == collectionId && x.Quantity > 0).ToList();
        
        if (cardsToSort.Count == 0)
        {
            return BadRequest("Esta coleção não possui mais cartas disponíveis no estoque.");
        }

        // Deduzir os pontos da UserGalera
        userGalera.DuelPoints -= price;
        _context.UserGalera.Update(userGalera);

        // Para OpenBooster, usamos a quantidade do banco (estoque) e decrementamos o banco depois
        var sortedCards = SortCards(cardsToSort, 9, useCardQuantity: true);

        _playerCollectionService.AddCards(user.Id, sortedCards.Select(c => new UpdatePlayerCollectionDto { CardId = c.Id, Quantity = 1 }).ToList());
        _gatchaService.DecrementCardsStock(sortedCards.Select(c => c.Id).ToList());

        _context.SaveChanges();

        var resultDtos = _mapper.Map<List<ReadCardResponseDto>>(sortedCards);
        return Ok(resultDtos);
    }

    private static List<Card> SortCards(List<Card> cards, int returnQuantity, bool useCardQuantity)
    {
        List<Card> result = new List<Card>();
        if (cards.Count == 0) return result;

        // Se não estivermos usando a quantidade do banco, inicializamos pesos temporários baseados na raridade
        var tempWeights = cards.ToDictionary(c => c.Id, c => useCardQuantity ? c.Quantity : SetQuantityByRarity(c.Rarity));

        for (int i = 0; i < returnQuantity; i++)
        {
            int weight = tempWeights.Values.Sum();
            if (weight == 0) break;

            int sorted = random.Next(1, weight + 1);
            int total = 0;

            foreach (var card in cards)
            {
                int cardWeight = tempWeights[card.Id];
                total += cardWeight;

                if (sorted <= total)
                {
                    result.Add(card);
                    // Decrementa o peso temporário para este sorteio
                    tempWeights[card.Id]--; 
                    break;
                }
            }
        }

        return result;
    }

    private static int SetQuantityByRarity(CardRarity rarity)
    {
        return rarity switch
        {
            CardRarity.COMMON => 16,
            CardRarity.RARE => 12,
            CardRarity.SUPER_RARE => 8,
            CardRarity.ULTRA_RARE => 6,
            CardRarity.SECRET_RARE => 4,
            _ => 4,
        };
    }
}
