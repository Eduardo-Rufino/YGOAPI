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
};
