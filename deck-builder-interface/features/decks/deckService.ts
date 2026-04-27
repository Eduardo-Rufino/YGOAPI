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
  horaDaConsulta: string;
  id?: string; // Optional ID if not provided by API
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:8080';

// Keep mock decks for persistence simulation in memory
const MOCK_DECKS: Deck[] = [];

export const deckService = {
  getDecks: async (): Promise<Deck[]> => {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_DECKS;
  },
  
  getDeckById: async (id: string): Promise<Deck | null> => {
    await new Promise(r => setTimeout(r, 400));
    return MOCK_DECKS.find(d => d.id === id) || null;
  },

  getAvailableCards: async (): Promise<Card[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Card?skip=0&take=100`);
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
      const response = await fetch(`${API_BASE_URL}/Card?skip=0&take=500`);
      if (!response.ok) return [];
      const data: Card[] = await response.json();
      const collections = Array.from(new Set(data.map(c => c.collection).filter(Boolean)));
      return collections.sort();
    } catch (error) {
      return [];
    }
  },

  saveDeck: async (name: string, cards: Card[]): Promise<Deck> => {
    await new Promise(r => setTimeout(r, 800));
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      cards,
      createdAt: new Date().toISOString().split('T')[0],
    };
    MOCK_DECKS.push(newDeck);
    return newDeck;
  }
};
