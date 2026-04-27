import React from 'react';
import Link from 'next/link';
import { deckService } from './deckService';
import styles from './DeckList.module.css';

export const DeckList: React.FC = async () => {
  const decks = await deckService.getDecks();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meus Decks</h1>
        <Link href="/decks/create" className={styles.createBtn}>
          Novo Deck
        </Link>
      </header>

      <div className={styles.grid}>
        {decks.map((deck) => (
          <Link key={deck.id} href={`/decks/${deck.id}`} className={styles.deckCard}>
            <div>
              <h2 className={styles.deckName}>{deck.name}</h2>
              <p className={styles.deckInfo}>Criado em: {deck.createdAt}</p>
            </div>
            <div>
              <span className={styles.cardCount}>{deck.cards.length} Cartas</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
