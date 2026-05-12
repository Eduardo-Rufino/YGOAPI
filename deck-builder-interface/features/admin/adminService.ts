import { authService } from '../auth/authService';
import { API_BASE_URL } from '@/features/config';



export interface YgoProDeckCardDto {
  id: number;
  name: string;
  type: string;
  desc: string;
  race: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  archetype?: string;
  card_images: { image_url: string }[];
  card_set?: string;
}

export const adminService = {
  fetchSetPreview: async (setName: string): Promise<YgoProDeckCardDto[]> => {
    const response = await fetch(`${API_BASE_URL}/Provider/${encodeURIComponent(setName)}`, {
      headers: {
        ...authService.getAuthHeaders(),
      }
    });
    if (!response.ok) throw new Error('Falha ao buscar preview da coleção');
    const result = await response.json();
    // In C# YgoProDeckDto, the list is in the 'Data' property, which becomes 'data' in JSON
    return result.data || result.Data || [];
  },

  confirmImport: async (galeraId: number, cards: YgoProDeckCardDto[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Provider/AddCollection/${galeraId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
      },
      body: JSON.stringify(cards)
    });
    if (!response.ok) throw new Error('Falha ao importar cartas');
  }
};
