'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { contestService, Contest } from '@/features/galeras/contestService';
import { galeraService, UserGalera } from '@/features/galeras/galeraService';
import styles from './Home.module.css';

export const HomePage: React.FC = () => {
  const [members, setMembers] = useState<UserGalera[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingContests, setLoadingContests] = useState(true);

  useEffect(() => {
    const loadGaleraData = async (galeraId: number) => {
      setLoadingMembers(true);
      setLoadingContests(true);

      const [membersResult, contestsResult] = await Promise.all([
        galeraService.getGaleraMembers(galeraId),
        contestService.getByGaleraId(galeraId),
      ]);

      setMembers(membersResult);
      setContests(contestsResult);
      setLoadingMembers(false);
      setLoadingContests(false);
    };

    const id = galeraService.getActiveGaleraId();
    setActiveGaleraId(id);

    if (id) {
      loadGaleraData(id);
    } else {
      setLoadingMembers(false);
      setLoadingContests(false);
    }

    const handleGaleraChange = () => {
      const newId = galeraService.getActiveGaleraId();
      setActiveGaleraId(newId);
      if (newId) {
        loadGaleraData(newId);
      } else {
        setMembers([]);
        setContests([]);
        setLoadingMembers(false);
        setLoadingContests(false);
      }
    };

    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  return (
    <div className={styles.homeLayout}>
      <main className={styles.mainContent}>
        <div className={styles.heroWrapper}>
          <div className={styles.hero}>
            <h1 className={styles.title}>
              Dominance starts <br />
              with <span className={styles.textGradient}>Strategy.</span>
            </h1>
            <p className={styles.subtitle}>
              O ecossistema definitivo para organizar sua coleção,
              testar decks e competir com a sua Galera.
            </p>
            <Link href="/decks/create" className={styles.cta}>
              Construir Deck
            </Link>
          </div>
        </div>

        <section className={styles.panelsSection}>
          <div className={styles.membersPanel}>
            <div className={styles.panelHeader}>
              <h2>Membros da Galera</h2>
              <span>{members.length} membros</span>
            </div>
            {activeGaleraId ? (
              loadingMembers ? (
                <p className={styles.panelLoading}>Carregando membros...</p>
              ) : members.length > 0 ? (
                <ul className={styles.memberList}>
                  {members.map(member => (
                    <li key={member.userId} className={styles.memberItem}>
                      <span className={styles.memberAvatar}>{member.username.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{member.username}</strong>
                        <p>{member.duelPoints} DP</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.panelEmpty}>Nenhum membro encontrado nesta galera.</p>
              )
            ) : (
              <p className={styles.panelEmpty}>Nenhuma galera ativa selecionada.</p>
            )}
          </div>

          <div className={styles.contestsPanel}>
            <div className={styles.panelHeader}>
              <h2>Competições</h2>
              <span>{contests.length}</span>
            </div>
            {activeGaleraId ? (
              loadingContests ? (
                <p className={styles.panelLoading}>Carregando competições...</p>
              ) : contests.length > 0 ? (
                <div className={styles.contestList}>
                  {contests.map(contest => (
                    <article key={contest.id} className={styles.contestCard}>
                      <div className={styles.contestTitleRow}>
                        <strong>{contest.name}</strong>
                        <span className={contest.isFinished ? styles.statusFinished : styles.statusActive}>
                          {contest.isFinished ? 'Finalizado' : 'Ativo'}
                        </span>
                      </div>
                      <p>Tipo: {contest.type === 0 ? 'Mata-mata' : 'Pontos'}</p>
                      {contest.currentStage != null && <p>Fase atual: {contest.currentStage}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.panelEmpty}>Nenhuma competição ocorrendo no momento.</p>
              )
            ) : (
              <p className={styles.panelEmpty}>Nenhuma galera ativa selecionada.</p>
            )}
          </div>
        </section>

        <div className={styles.bannersSection}>
          <Link href="/collections" className={`${styles.bannerCard} ${styles.bannerCollections}`}>
            <div className={styles.bannerIcon}>✦</div>
            <h2 className={styles.bannerTitle}>Coleções</h2>
            <p className={styles.bannerDesc}>Explore pacotes de expansão e construa seu arsenal.</p>
          </Link>

          <Link href="/gatcha" className={`${styles.bannerCard} ${styles.bannerGatcha}`}>
            <div className={styles.bannerIcon}>⟡</div>
            <h2 className={styles.bannerTitle}>Loja (Gatcha)</h2>
            <p className={styles.bannerDesc}>Abra boosters e tente a sorte para cartas raras.</p>
          </Link>

          <div className={`${styles.bannerCard} ${styles.bannerMeta}`}>
            <div className={styles.bannerIcon}>☯</div>
            <h2 className={styles.bannerTitle}>Metagame</h2>
            <p className={styles.bannerDesc}>Acompanhe o formato e a banlist da sua Galera.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
