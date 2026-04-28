import React from 'react';
import Link from 'next/link';
import { deckService } from './deckService';
import styles from './DeckDetail.module.css';

interface Props {
  id: string;
}

export const DeckDetailPage: React.FC<Props> = async ({ id }) => {
  const deck = await deckService.getDeckById(id);

  if (!deck) {
    return (
      <div className={styles.container}>
        <h1>Deck não encontrado</h1>
        <Link href="/decks" className={styles.backBtn}>Voltar para lista</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/decks" className={styles.backBtn}>← Voltar para Decks</Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>{deck.name}</h1>
        <p className={styles.subtitle}>{deck.cards.length} cartas • Criado em {deck.createdAt}</p>
      </header>

      <div className={styles.cardGrid}>
        {deck.cards.map((card, idx) => (
          <div key={`${card.name}-${idx}`} className={styles.card}>
            <p className={styles.cardType}>Lvl {card.level}</p>
            <h3 className={styles.cardName}>{card.name}</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
              ATK {card.attack} / DEF {card.defense}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
