using System.Collections.Generic;

namespace YGOApi.Services.Gatcha
{
    public interface IGatchaService
    {
        void DecrementCardsStock(List<int> cardIds);
    }
}
