using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.YgoProDeck;
using YGOApi.Integrations;
using YGOApi.Models;
using YGOApi.Services.Storage;

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
public class ProviderController(WriteContext context, ICardProvider provider, IStorageService storage) : ControllerBase
{
    /// <summary>
    /// Recupera colleções e starter decks do provedor externo ordenado por lançamento.
    /// </summary>
    /// <returns>
    /// Retorna <see cref="IActionResult"/> com o conteúdo obtido do provedor.
    /// Em caso de sucesso, responde com 200 (OK) contendo os dados retornados pelo provedor.
    /// </returns>
    [HttpGet("CardSets")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> GetCardSetsByProvider([FromQuery] int galeraId)
    {
        var cardSets = await provider.ListCardSets();

        var collectionsInDb = context.GaleraCollections.Where(x => x.GaleraId == galeraId).Select(x => x.CardCollection.Name).ToList();

        cardSets.ForEach(x => x.IsActive = collectionsInDb.Any(c => c == x.SetName));

        var starterDecks = cardSets
            .Where(x => x.SetName.StartsWith("starter deck:", StringComparison.CurrentCultureIgnoreCase) ||
                        x.SetName.StartsWith("super starter:", StringComparison.CurrentCultureIgnoreCase) ||
                        x.SetName.StartsWith("egyptian god deck:", StringComparison.CurrentCultureIgnoreCase))
            .ToList();

        var tournamentPacks = cardSets
            .Where(x => 
                x.SetName.StartsWith("tournament pack ", StringComparison.CurrentCultureIgnoreCase) ||
                x.SetName.StartsWith("tournament pack:", StringComparison.CurrentCultureIgnoreCase))
            .ToList();

        cardSets.RemoveAll(
            x => starterDecks.Any(s => s.SetName == x.SetName) || 
            tournamentPacks.Any(s => s.SetName == x.SetName));


        return Ok(new YgoProDeckCardSetDtos()
        {
            Collections = cardSets,
            StarterDecks = starterDecks,
            TournamentPacks = tournamentPacks
        });
    }

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
        var response = await provider.ListCardByCollection(collectionName);
        
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
        CardCollection? cardCollection = context.CardCollections.FirstOrDefault(x => x.Name == cardList[0].CardSet);
        if (cardCollection != null)
        {
            if (!context.GaleraCollections.Any(x => x.GaleraId == galeraId && x.CardCollectionId == cardCollection.Id))
            {
                context.GaleraCollections.Add(new GaleraCollection()
                {
                    GaleraId = galeraId,
                    CardCollectionId = cardCollection.Id,
                });

                context.SaveChanges();

                return NoContent();
            }

            return Ok("Coleção já inserida!");
        }

        cardCollection = new CardCollection()
        {
            Name = cardList[0].CardSet
        };

        context.CardCollections.Add(cardCollection);

        context.SaveChanges();

        List<Card> cardsToInsert = cardList.Select(dto => CardFactory.CreateCardFromYgoProDeckDto(dto, cardCollection.Id)).ToList();

        context.Cards.AddRange(cardsToInsert);

        context.GaleraCollections.Add(new GaleraCollection()
        {
            GaleraId = galeraId,
            CardCollectionId = cardCollection.Id,
        });

        context.SaveChanges();

        return NoContent();
    }


    [HttpPost("AtualizarCardsDb")]
    public async Task<IActionResult> AtualizarCardsDb()
    {
        var cards = context.Cards.ToList();

        foreach (var card in cards)
        {
            //baixar imagem pela url
            HttpClient httpClient = new HttpClient();

            // Baixa a imagem como stream
            var imageStream = await httpClient.GetStreamAsync(card.ImageUrlSmall);

            // Converte para StreamContent
            var streamContent = new StreamContent(imageStream);

            // Opcional: definir content-type
            streamContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");

            card.ImageUrlSmall = storage.Upload(streamContent, $"{card.Passcode}_{card.Name}", "cards").ToString();
        };

        context.UpdateRange(cards);
        context.SaveChanges();

        return Ok();
    }
}