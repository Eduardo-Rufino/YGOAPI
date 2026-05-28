'use client';

import React, { useState, useEffect } from 'react';
import { contestService, Contest } from './contestService';
import { galeraService } from './galeraService';
import styles from './ContestSidebar.module.css';

export const ContestSidebar: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);

  const fetchContests = async (id: number) => {
    setLoading(true);
    try {
      const data = await contestService.getByGaleraId(id);
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = galeraService.getActiveGaleraId();
    setActiveGaleraId(id);
    if (id) fetchContests(id);

    const handleGaleraChange = () => {
      const newId = galeraService.getActiveGaleraId();
      setActiveGaleraId(newId);
      if (newId) fetchContests(newId);
      else setContests([]);
    };

    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  if (!activeGaleraId) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>
          Torneios
          <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)' }}>{contests.length}</span>
        </h3>

        {loading ? (
          <div className={styles.loadingState}>Buscando dados...</div>
        ) : contests.length > 0 ? (
          <div className={styles.contestList}>
            {contests.map(contest => (
              <div 
                key={contest.id} 
                className={`${styles.contestCard} ${contest.isFinished ? styles.contestCardFinished : ''}`}
                title="Visualizar Torneio (Em breve)"
              >
                <div className={styles.contestName}>
                  <span>{contest.name}</span>
                  <span className={`${styles.contestStatus} ${contest.isFinished ? styles.statusFinished : styles.statusActive}`}>
                    {contest.isFinished ? 'Finalizado' : 'Ativo'}
                  </span>
                </div>
                <div className={styles.contestInfo}>
                  <span>Tipo: {contest.type === 0 ? 'Mata-mata' : 'Pontos'}</span>
                  {contest.currentStage && <span>Fase Atual: {contest.currentStage}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            Nenhum torneio ocorrendo no momento.
          </div>
        )}
      </div>
    </aside>
  );
};
