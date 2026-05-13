import { authService } from '@/features/auth/authService';
import { API_BASE_URL } from '@/features/config';
import { galeraService } from '@/features/galeras/galeraService';


export interface Card {
  name: string;
  attribute: number;
  level: number;
  type: number;
  subType: number;
  race: number;
  effect: string;
  attack: number;
  defense: number;
  collection: string;
  archetype: string;
  pendulumScale: number;
  linkRating: number;
  linkMarkers: string;
  banStatus: number;
  imageUrl: string;
  imageUrlSmall: string;
  horaDaConsulta: string;
  passcode: number;
  id?: string;
  quantity?: number;
  hasCard?: boolean;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: string;
  deckCover?: string; // Image URL for the deck cover
  cardCount?: number; // Total number of cards
}


export const deckService = {
  getDecks: async (): Promise<Deck[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Deck`, { 
        cache: 'no-store',
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      if (!response.ok) throw new Error('Failed to fetch decks');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch decks', error);
      return [];
    }
  },

  getDeckById: async (id: string): Promise<Deck | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Deck/${id}`, { 
        cache: 'no-store',
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch deck by ID', error);
      return null;
    }
  },

  getDeckCardsData: async (id: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Deck/${id}`, { 
        cache: 'no-store',
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch deck cards', error);
      return [];
    }
  },

  getAvailableCards: async (skip: number = 0, take: number = 10000, galeraId?: number | null): Promise<Card[]> => {
    try {
      let url = `${API_BASE_URL}/Card?skip=${skip}&take=${take}`;
      if (galeraId) url += `&galeraId=${galeraId}`;

      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch cards from API, falling back to empty list:', error);
      return [];
    }
  },

  getCollections: async (): Promise<string[]> => {
    try {
      const galeraId = galeraService.getActiveGaleraId();
      
      // Se houver uma galera ativa, buscamos as coleções vinculadas a ela
      if (galeraId) {
        const response = await fetch(`${API_BASE_URL}/Galera/${galeraId}/Collections`, {
          headers: {
            ...authService.getAuthHeaders(),
          }
        });
        if (response.ok) return await response.json();
      }

      // Fallback para o comportamento antigo (baseado em cards) caso não haja galera ou o endpoint falhe
      const response = await fetch(`${API_BASE_URL}/Card?skip=0&take=1000`, {
        headers: {
          ...authService.getAuthHeaders(),
        }
      });
      if (!response.ok) return [];
      const data: any[] = await response.json();
      const collections = Array.from(new Set(data.map(c => c.collection).filter(Boolean)));
      return collections.sort();
    } catch (error) {
      console.error('Failed to fetch collections', error);
      return [];
    }
  },

  createDeck: async (name: string, deckCover?: string | null): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/Deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ name, deckCover }),
    });
    if (!response.ok) throw new Error(`Failed to create deck: ${response.statusText}`);
    return await response.json();
  },

  updateDeckInfo: async (deckId: string, name: string, deckCover?: string | null): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Deck/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify({ name, deckCover }),
    });
    if (!response.ok) throw new Error(`Failed to update deck info: ${response.statusText}`);
  },

  deleteDeck: async (deckId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Deck/${deckId}`, {
      method: 'DELETE',
      headers: {
        ...authService.getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error(`Failed to delete deck: ${response.statusText}`);
  },

  updateCardsOnDeck: async (deckId: string, cards: Card[]): Promise<void> => {
    // Aggregate cards by id to form { cardId, quantity } expected by the backend
    const cardCounts: Record<string, number> = {};
    for (const card of cards) {
      // Assuming card.id exists since it comes from the database
      const cardId = card.id;
      if (cardId !== undefined) {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
      }
    }

    const payload = Object.entries(cardCounts).map(([cardId, quantity]) => ({
      cardId: parseInt(cardId, 10),
      quantity
    }));

    const response = await fetch(`${API_BASE_URL}/Deck/UpdateCardsOnDeck/${deckId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cards: ${response.statusText}`);
    }
  },

  saveDeck: async (name: string, cards: Card[], existingDeckId?: string, deckCover?: string | null): Promise<void> => {
    try {
      let targetDeckId: string | null = existingDeckId || null;

      // 1. Check if the deck already exists by name if not editing a specific ID
      if (!targetDeckId) {
        const allDecks = await deckService.getDecks();
        const existingDeck = allDecks.find(d => d.name === name);
        
        if (existingDeck) {
          targetDeckId = existingDeck.id;
        }
      }

      if (targetDeckId) {
        // Deck already exists -> update info and cards
        await deckService.updateDeckInfo(targetDeckId, name, deckCover);
        await deckService.updateCardsOnDeck(targetDeckId, cards);
      } else {
        // Deck doesn't exist -> create new deck with cover, then add cards
        const newDeck = await deckService.createDeck(name, deckCover);
        // The API might return the deck object { id: '...', name: '...' } or just the ID. 
        const newDeckId = newDeck.id || newDeck.deckId || newDeck; 
        if (!newDeckId) throw new Error("Could not retrieve new deck ID");
        
        await deckService.updateCardsOnDeck(newDeckId, cards);
      }
    } catch (error) {
      console.error("Error in saveDeck orchestration:", error);
      throw error;
    }
  }
};
