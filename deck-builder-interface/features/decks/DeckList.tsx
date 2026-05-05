'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deckService, Deck } from './deckService';
import { authService } from '@/features/auth/authService';
import styles from './DeckList.module.css';

export const DeckList: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const router = useRouter();

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const data = await deckService.getDecks();
      setDecks(data);
    } catch (error) {
      console.error('Failed to fetch decks', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDecks();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;

    try {
      await deckService.deleteDeck(deckToDelete.id);
      showNotification('Deck deletado com sucesso!', 'success');
      setDeckToDelete(null);
      fetchDecks();
    } catch (error) {
      showNotification('Erro ao deletar deck.', 'error');
    }
  };

  const handleCopy = async (e: React.MouseEvent, deck: Deck) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const cardsOnDeck = await deckService.getDeckCardsData(deck.id);
      if (!cardsOnDeck || cardsOnDeck.length === 0) {
        showNotification('O deck está vazio ou não foi encontrado.', 'error');
        return;
      }

      const cardsToCopy: any[] = [];
      cardsOnDeck.forEach((item: any) => {
        for (let i = 0; i < item.quantity; i++) {
          cardsToCopy.push({
            id: item.cardId.toString(),
            name: item.cardName,
            imageUrl: item.imageUrl
          });
        }
      });

      const copyName = `Cópia de ${deck.name}`;
      await deckService.saveDeck(copyName, cardsToCopy, undefined, deck.deckCover);
      
      showNotification('Cópia criada com sucesso!', 'success');
      fetchDecks();
    } catch (error) {
      console.error('Failed to copy deck', error);
      showNotification('Erro ao copiar deck.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* Custom Delete Modal */}
      {deckToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>⚠️</span>
              <h2 className={styles.modalTitle}>Excluir Deck?</h2>
            </div>
            <p className={styles.modalText}>
              Você está prestes a excluir o deck <strong>{deckToDelete.name}</strong>. 
              Esta ação não pode ser desfeita.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setDeckToDelete(null)}>Não, manter</button>
              <button className={styles.btnConfirmDelete} onClick={confirmDelete}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>Meus Decks</h1>
        <Link href="/decks/create" className={styles.createBtn}>
          Novo Deck
        </Link>
      </header>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {decks.map((deck) => {
            const cardsCount = deck.cardCount !== undefined ? deck.cardCount : (deck.cards ? deck.cards.length : 0);
            const coverImage = deck.deckCover || '/CardBack.jpg';
            const creationDate = deck.createdAt || (deck as any).horaDaConsulta || '';

            return (
              <div key={deck.id} className={styles.deckCardWrapper}>
                <div className={styles.deckCard}>
                  <div className={styles.coverContainer}>
                    <img src={coverImage} alt={`Capa do deck ${deck.name}`} className={styles.coverImage} />
                    <div className={styles.deckOverlay}>
                      <span className={styles.cardCountBadge}>{cardsCount} Cartas</span>
                    </div>
                    
                    <div className={styles.actionsOverlay}>
                      <button 
                        onClick={() => router.push(`/decks/${deck.id}`)} 
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Editar Deck"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={(e) => handleCopy(e, deck)} 
                        className={styles.actionBtn}
                        title="Criar Cópia"
                      >
                        📋
                      </button>
                      <button 
                        onClick={() => setDeckToDelete(deck)} 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Deletar Deck"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className={styles.deckInfoBox} onClick={() => router.push(`/decks/${deck.id}`)}>
                    <h2 className={styles.deckName} title={deck.name}>{deck.name}</h2>
                    <div className={styles.deckFooter}>
                      {creationDate && (
                        <p className={styles.deckDate}>
                          {new Date(creationDate).toLocaleDateString()}
                        </p>
                      )}
                      <span className={styles.editLabel}>Editar →</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
