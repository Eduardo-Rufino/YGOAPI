import { API_BASE_URL } from '@/features/config';
import { authService } from '@/features/auth/authService';

export interface CardLimitation {
  cardId: number;
  status: number; // 0=Unlimited, 1=Semi-Limited, 2=Limited, 3=Banned
}

export interface BanlisttDto {
  name: string;
  banlist: CardLimitation[];
}

export interface BanlistModel {
  id: number;
  name: string;
}

export const banlistService = {
  getBanlists: async (): Promise<BanlistModel[]> => {
    const response = await fetch(`${API_BASE_URL}/Banlist`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  },

  getBanlist: async (id: number): Promise<BanlisttDto | null> => {
    const response = await fetch(`${API_BASE_URL}/Banlist/${id}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  createBanlist: async (dto: BanlisttDto): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/Banlist`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Falha ao criar banlist.');
    return await response.json();
  },

  editBanlist: async (id: number, dto: BanlisttDto): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/Banlist/Edit/${id}`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Falha ao editar banlist.');
    return await response.json();
  },

  deleteBanlist: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Banlist/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Falha ao excluir banlist.');
  }
};
