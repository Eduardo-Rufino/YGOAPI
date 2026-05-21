'use client';

import { API_BASE_URL } from '@/features/config';
import { authService } from '@/features/auth/authService';

export interface Contest {
  id: number;
  name: string;
  galeraId: number;
  type: number; // ContestType enum
  isFinished: boolean;
  winnerId?: number | null;
  currentStage?: number | null;
}

export interface Match {
  id: number;
  contestId: number;
  player1Id: number;
  player2Id?: number | null;
  winnerId?: number | null;
  stage: number; // ContestStage enum
}

export interface ContestDetail {
  contest: Contest;
  matches: Match[];
}

export interface Banlist {
  id: number;
  name: string;
}

export interface CreateContestDto {
  galeraId: number;
  banlistId?: number | null;
  name: string;
  type: number;
}

export const contestService = {
  getByGaleraId: async (galeraId: number): Promise<Contest[]> => {
    const response = await fetch(`${API_BASE_URL}/Contest/GetByGaleraId/${galeraId}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  },

  getContestDetail: async (contestId: number): Promise<ContestDetail | null> => {
    const response = await fetch(`${API_BASE_URL}/Contest/${contestId}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  setMatchWinner: async (matchId: number, winnerUserId: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/Match/${matchId}/SetWinner?winnerUserId=${winnerUserId}`,
      {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error('Falha ao definir vencedor da partida.');
    }
  },

  getBanlists: async (): Promise<Banlist[]> => {
    const response = await fetch(`${API_BASE_URL}/Banlist`, {
      headers: authService.getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  },

  createContest: async (dto: CreateContestDto): Promise<Contest> => {
    const response = await fetch(`${API_BASE_URL}/Contest`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Falha ao criar competição.');
    }
    
    return await response.json();
  },

  finishContest: async (contestId: number, winnerUserId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/Contest/${contestId}/Finish?winnerId=${winnerUserId}`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Falha ao encerrar competição.');
    }
  },
};
