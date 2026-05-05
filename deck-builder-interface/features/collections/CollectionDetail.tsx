'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { deckService, Card } from '@/features/decks/deckService';
import styles from './CollectionDetail.module.css';

interface CollectionDetailProps {
  name: string;
}

export const CollectionDetail: React.FC<CollectionDetailProps> = ({ name }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const decodedName = decodeURIComponent(name);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        // Get all cards and filter by collection name
        // In a real scenario, we might want an API endpoint /Card/ByCollection/{name}
        const allCards = await deckService.getAvailableCards(0, 5000);
        const filteredSetCards = allCards.filter(c => c.collection === decodedName);
        
        // Final logic: Monster, Spell, Trap
        const monsters = filteredSetCards.filter(c => c.type === 0);
        const spells = filteredSetCards.filter(c => c.type === 1);
        const traps = filteredSetCards.filter(c => c.type === 2);
        
        setCards([...monsters, ...spells, ...traps]);
      } catch (error) {
        console.error('Failed to fetch set cards', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, [decodedName]);

  if (isLoading) return <div className={styles.loading}>Carregando cartas da coleção...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/collections" className={styles.backLink}>
          ← Voltar para Coleções
        </Link>
        <h1 className={styles.title}>{decodedName}</h1>
        <p className={styles.subtitle}>Explorando {cards.length} cartas nesta coleção.</p>
      </header>

      <div className={styles.grid}>
        {cards.map(card => (
          <div key={card.id} className={styles.cardItem}>
            <img src={card.imageUrl || '/CardBack.jpg'} alt={card.name} className={styles.cardImage} />
            <div className={styles.cardOverlay}>
              <div className={styles.cardName}>{card.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
