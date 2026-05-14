using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Data.Enums;
using YGOApi.Integrations;
using YGOApi.Models;

namespace YGOApi.Controllers;

/// <summary>
/// Controller responsável por expor endpoints para interação com provedores externos de cartas
/// e para persistência de cartas obtidas via integrações.
/// </summary>
/// <param name="context">Instância de <see cref="WriteContext"/> para persistência de dados.</param>
/// <param name="provider">Implementação de <see cref="ICardProvider"/> usada para recuperar cartas de provedores externos.</param>
/// <remarks>
/// Utiliza <see cref="WriteContext"/> para operações de persistência e <see cref="ICardProvider"/>
/// para comunicação com provedores externos (ex.: YgoProDeck).
/// </remarks>
[ApiController]
[Route("[controller]")]
public class ProviderController(WriteContext context, ICardProvider provider) : ControllerBase
{
    /// <summary>
    /// Contexto de acesso ao banco de dados para a entidade <see cref="Card"/>.
    /// </summary>
    private WriteContext _context = context;

    /// <summary>
    /// Implementação do provedor de cartas que realiza chamadas a integrações externas.
    /// </summary>
    private ICardProvider _provider = provider;

    /// <summary>
    /// Recupera cartas do provedor externo pela coleção fornecida.
    /// </summary>
    /// <param name="collectionName">Nome da coleção no provedor (por exemplo, identificador de deck/coleção no serviço externo).</param>
    /// <returns>
    /// Retorna <see cref="IActionResult"/> com o conteúdo obtido do provedor.
    /// Em caso de sucesso, responde com 200 (OK) contendo os dados retornados pelo provedor.
    /// </returns>
    [HttpGet("{collectionName}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> GetCardsByProviderCollection(string collectionName)
    {
        var response = await _provider.ListCardByCollection(collectionName);
        
        return Ok(response);
    }

    /// <summary>
    /// Converte uma lista de DTOs do YgoProDeck para entidades <see cref="Card"/> e persiste no banco.
    /// </summary>
    /// <param name="cardList">Lista de <see cref="YgoProDeckCardDto"/> recebida no corpo da requisição.</param>
    /// <returns>
    /// Retorna 204 (NoContent) quando as cartas são persistidas com sucesso.
    /// </returns>
    /// <remarks>
    /// - A conversão é feita via <see cref="CardFactory.CreateCardFromYgoProDeckDto"/>.<br/>
    /// - Não há validação explícita de duplicatas ou integridade aqui; considerar adições futuras para deduplicação e validação.
    /// </remarks>
    [HttpPost("AddCollection/{galeraId}")]
    [Authorize(Policy = "Admin")]
    public IActionResult AddCardsCollectionProvider(int galeraId, [FromBody] List<YgoProDeckCardDto> cardList)
    {
        CardCollection? cardCollection = _context.CardCollections.FirstOrDefault(x => x.Name == cardList[0].CardSet);
        if (cardCollection != null)
        {
            if (!_context.GaleraCollections.Any(x => x.GaleraId == galeraId && x.CardCollectionId == cardCollection.Id))
            {
                _context.GaleraCollections.Add(new GaleraCollection()
                {
                    GaleraId = galeraId,
                    CardCollectionId = cardCollection.Id,
                });

                _context.SaveChanges();

                return NoContent();
            }

            return Ok("Coleção já inserida!");
        }

        cardCollection = new CardCollection()
        {
            Name = cardList[0].CardSet
        };

        _context.CardCollections.Add(cardCollection);

        _context.SaveChanges();

        List<Card> cardsToInsert = cardList.Select(dto => CardFactory.CreateCardFromYgoProDeckDto(dto, cardCollection.Id)).ToList();

        _context.Cards.AddRange(cardsToInsert);

        _context.GaleraCollections.Add(new GaleraCollection()
        {
            GaleraId = galeraId,
            CardCollectionId = cardCollection.Id,
        });

        _context.SaveChanges();

        return NoContent();
    }

    [HttpGet("UpdateRarity/{collectionName}")]
    public async Task<IActionResult> UpdateRarityAndQuantity(string collectionName)
    {
        var providerCards = await _provider.ListCardByCollection(collectionName);

        var dbCards = _context.Cards.Where(x => x.CardCollection.Name == collectionName).ToList();

        dbCards.ForEach(dbCard =>
        {
            var providerCard = providerCards.Data.FirstOrDefault(x => x.Name == dbCard.Name);
            if (providerCard != null)
            {
                dbCard.Rarity = providerCard.Rarity;
                dbCard.Quantity = SetQuantity(providerCard.Rarity);
            }
        });
        _context.UpdateRange(dbCards);
        _context.SaveChanges();

        return Ok();
    }

    private static int SetQuantity(CardRarity rarity)
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