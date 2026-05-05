using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YGOApi.Data;
using YGOApi.Data.Dtos.YgoProDeck;
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
    public async Task<IActionResult> GetCardByProviderCollection(string collectionName)
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
    [HttpPost("AddCardProvider")]
    [Authorize(Policy = "Admin")]
    public IActionResult AddCardsProvider([FromBody] List<YgoProDeckCardDto> cardList)
    {
        List<Card> cardsToInsert = new List<Card>();

        // Get all existing Passcodes and ImageUrls to check in memory (performance)
        var existingCards = _context.Cards
            .Select(c => new { c.Passcode, c.ImageUrl })
            .ToList();

        foreach (var dto in cardList)
        { 
            // Check if this specific card (Passcode + Image) already exists
            bool exists = existingCards.Any(c => c.Passcode == dto.Id && c.ImageUrl == dto.CardImages[0].ImageUrl);

            if (!exists)
            {
                var newCard = CardFactory.CreateCardFromYgoProDeckDto(dto);
                cardsToInsert.Add(newCard);
                
                // Add to our local check list to avoid duplicates within the same batch
                existingCards.Add(new { Passcode = dto.Id, ImageUrl = dto.CardImages[0].ImageUrl });
            }
        }

        if (cardsToInsert.Count > 0)
        {
            _context.Cards.AddRange(cardsToInsert);
            _context.SaveChanges();
        }

        return NoContent();
    }
}
