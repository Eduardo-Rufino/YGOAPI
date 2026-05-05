'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deckService } from '@/features/decks/deckService';
import styles from './CollectionsList.module.css';

export const CollectionsList: React.FC = () => {
  const [collections, setCollections] = useState<{name: string, coverUrl: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [colls, allCards] = await Promise.all([
          deckService.getCollections(),
          deckService.getAvailableCards(0, 10000)
        ]);

        const collData = colls.map(setName => {
          // Find the "Mascot": Monster with highest ATK in this set
          const setCards = allCards.filter(c => c.collection === setName);
          const monsters = setCards.filter(c => c.type === 0); // Type 0 is Monster
          
          let mascot = monsters.length > 0 
            ? monsters.reduce((prev, current) => (prev.attack || 0) > (current.attack || 0) ? prev : current)
            : setCards[0];

          return {
            name: setName,
            coverUrl: mascot?.imageUrl || '/CardBack.jpg'
          };
        });

        setCollections(collData);
      } catch (error) {
        console.error('Failed to fetch collections', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (isLoading) return <div className={styles.loading}>Carregando coleções...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Coleções Disponíveis</h1>
      <div className={styles.grid}>
        {collections.map(set => (
          <Link key={set.name} href={`/collections/${encodeURIComponent(set.name)}`} className={styles.setCard}>
            <div className={styles.cardImageWrapper}>
              <img src={set.coverUrl} alt={set.name} className={styles.setCover} />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.setInfo}>
              <h2 className={styles.setName}>{set.name}</h2>
              <span className={styles.setView}>Explorar Cartas</span>
            </div>
          </Link>
        ))}
        {collections.length === 0 && (
          <div className={styles.loading}>Nenhuma coleção encontrada no banco de dados.</div>
        )}
      </div>
    </div>
  );
};
