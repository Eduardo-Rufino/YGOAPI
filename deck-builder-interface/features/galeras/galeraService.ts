'use client';

import { API_BASE_URL } from '@/features/config';
import { authService } from '@/features/auth/authService';

export interface Galera {
  id: number;
  name: string;
}

export interface UserGalera {
  galeraId: number;
  userId: number;
  username: string;
  duelPoints: number;
}

export const galeraService = {
  // Retorna as galeras que o usuário logado pertence
  getMyGaleras: async (): Promise<Galera[]> => {
    const response = await fetch(`${API_BASE_URL}/Galera/My`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  },

  // Retorna todos os membros de uma galera específica
  getGaleraMembers: async (galeraId: number): Promise<UserGalera[]> => {
    const response = await fetch(`${API_BASE_URL}/Galera/${galeraId}/Members`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    const data = await response.json();
    // Map to frontend interface if needed
    return data.map((m: any) => ({
      galeraId,
      userId: m.userId,
      username: m.username,
      duelPoints: m.duelPoints
    }));
  },

  // Cria uma nova galera na API
  createGalera: async (name: string): Promise<Galera> => {
    const response = await fetch(`${API_BASE_URL}/Galera`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Name: name }),
    });
    if (!response.ok) {
      throw new Error('Falha ao criar galera.');
    }
    return await response.json();
  },

  // Busca usuários no sistema via API
  searchUsers: async (query: string): Promise<{id: number, username: string}[]> => {
    if (!query) return [];
    const response = await fetch(`${API_BASE_URL}/Autenticator/Search?query=${encodeURIComponent(query)}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  },

  // Adiciona membros à galera via API
  addMembers: async (galeraId: number, userIds: number[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Galera/AddMembers/${galeraId}`, {
      method: 'PATCH',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userIds),
    });
    if (!response.ok) {
      throw new Error('Falha ao adicionar membros.');
    }
  },

  // Remove membro da galera via API
  removeMember: async (galeraId: number, userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Galera/RemoveMembers/${galeraId}?memberId=${userId}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Falha ao remover membro.');
    }
  },

  // Gerenciamento Local da Galera Ativa
  setActiveGaleraId: (id: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ygo_active_galera_id', id.toString());
      window.dispatchEvent(new Event('active-galera-changed'));
    }
  },

  getActiveGaleraId: (): number | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ygo_active_galera_id');
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  }
};
