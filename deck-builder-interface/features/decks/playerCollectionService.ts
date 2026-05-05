'use client';

import { authService } from '@/features/auth/authService';

export interface PlayerCard {
  id: number;
  cardId: number;
  playerId: number;
  quantity: number;
}

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer ? 'http://ygoapi' : 'http://localhost:8080';

export const playerCollectionService = {
  /**
   * Fetches the collection for the current logged-in user.
   */
  getCollection: async (): Promise<PlayerCard[]> => {
    const userId = authService.getUserId();
    if (!userId) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/PlayerCollection/${userId}`, {
        headers: {
          ...authService.getAuthHeaders(),
        },
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch player collection', error);
      return [];
    }
  },

  /**
   * Adds cards to the player's collection.
   */
  addCards: async (cards: { cardId: number; quantity: number }[]): Promise<void> => {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/PlayerCollection/Add/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(cards),
    });

    if (!response.ok) throw new Error('Failed to add cards to collection');
  },

  /**
   * Removes cards from the player's collection.
   */
  removeCards: async (cardsToRemove: { cardId: number; quantity: number }[]): Promise<void> => {
    const userId = authService.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`${API_BASE_URL}/PlayerCollection/Remove/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(cardsToRemove),
    });

    if (!response.ok) throw new Error('Failed to remove cards from collection');
  },
};
