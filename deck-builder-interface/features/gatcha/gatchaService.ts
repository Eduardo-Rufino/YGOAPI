import { authService } from '@/features/auth/authService';
import { API_BASE_URL } from '@/features/config';
import { Card } from '@/features/decks/deckService';

export const gatchaService = {
  /**
   * Opens a single booster pack from a collection.
   * Decrements global stock.
   */
  openBooster: async (collectionId: number, galeraId: number): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/Gatcha/OpenBooster/${collectionId}/${galeraId}`, {
      headers: {
        ...authService.getAuthHeaders(),
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao abrir booster');
    }
    return await response.json();
  },

  /**
   * Opens a box (24 boosters) from a collection.
   * Does NOT decrement global stock.
   */
  openBox: async (collectionId: number): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/Gatcha/OpenBox/${collectionId}`, {
      headers: {
        ...authService.getAuthHeaders(),
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao abrir box');
    }
    return await response.json();
  }
};
