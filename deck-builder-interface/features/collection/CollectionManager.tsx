'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/authService';
import { deckService, Card } from '@/features/decks/deckService';
import { playerCollectionService, PlayerCard } from '@/features/decks/playerCollectionService';
import styles from './CollectionManager.module.css';

export const CollectionManager: React.FC = () => {
  const router = useRouter();
  
  // Data State
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [playerCollection, setPlayerCollection] = useState<PlayerCard[]>([]);
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Filter State
  const [searchName, setSearchName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const init = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }
      setIsLoading(true);
      try {
        const [cards, colls, pCollection] = await Promise.all([
          deckService.getAvailableCards(),
          deckService.getCollections(),
          playerCollectionService.getCollection()
        ]);
        
        setAvailableCards(cards);
        setCollections(colls);
        setPlayerCollection(pCollection);

        // Map current collection to local state
        const quantities: Record<number, number> = {};
        pCollection.forEach(pc => {
          quantities[pc.cardId] = pc.quantity;
        });
        setLocalQuantities(quantities);
      } catch (error) {
        console.error('Failed to load collection data', error);
        showNotification('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

  const handleQuantityChange = (cardId: number, delta: number) => {
    setLocalQuantities(prev => ({
      ...prev,
      [cardId]: Math.max(0, (prev[cardId] || 0) + delta)
    }));
  };

  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      if (searchName && !card.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (selectedCollection && card.collection !== selectedCollection) return false;
      return true;
    });
  }, [availableCards, searchName, selectedCollection]);

  const hasChanges = useMemo(() => {
    // Check if any quantity in local state differs from the original collection
    return availableCards.some(card => {
      const original = playerCollection.find(pc => pc.cardId.toString() === card.id?.toString())?.quantity || 0;
      const current = localQuantities[Number(card.id)] || 0;
      return original !== current;
    });
  }, [availableCards, playerCollection, localQuantities]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toAdd: { cardId: number; quantity: number }[] = [];
      const toRemove: { cardId: number; quantity: number }[] = [];

      availableCards.forEach(card => {
        const cardIdNum = Number(card.id);
        const original = playerCollection.find(pc => pc.cardId === cardIdNum)?.quantity || 0;
        const current = localQuantities[cardIdNum] || 0;

        if (current > original) {
          toAdd.push({ cardId: cardIdNum, quantity: current - original });
        } else if (current < original) {
          toRemove.push({ cardId: cardIdNum, quantity: original - current });
        }
      });

      if (toAdd.length > 0) await playerCollectionService.addCards(toAdd);
      if (toRemove.length > 0) await playerCollectionService.removeCards(toRemove);

      // Refresh data
      const updatedColl = await playerCollectionService.getCollection();
      setPlayerCollection(updatedColl);
      showNotification('Coleção atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Failed to save changes', error);
      showNotification('Erro ao salvar alterações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className={styles.loading}>Carregando banco de dados...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Minha Coleção Pessoal</h1>
        <div className={styles.actions}>
          <button 
            className={styles.saveButton} 
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      <section className={styles.filterSection}>
        <div className={styles.searchRow}>
          <input 
            type="text" 
            placeholder="Pesquisar carta por nome..." 
            className={styles.searchInput}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <select 
            className={styles.searchInput}
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="">Todas as Coleções</option>
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </section>

      <div className={styles.grid}>
        {filteredCards.map(card => {
          const cardIdNum = Number(card.id);
          const quantity = localQuantities[cardIdNum] || 0;
          const original = playerCollection.find(pc => pc.cardId === cardIdNum)?.quantity || 0;
          const isModified = quantity !== original;

          return (
            <div 
              key={card.id} 
              className={`${styles.cardItem} ${isModified ? styles.hasChanges : ''}`}
            >
              {quantity > 0 && <div className={styles.ownedBadge}>x{quantity}</div>}
              <img src={card.imageUrl || '/CardBack.jpg'} alt={card.name} className={styles.cardImage} />
              
              <div className={styles.cardOverlay}>
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{card.name}</div>
                  <div className={styles.controls}>
                    <button className={styles.controlBtn} onClick={() => handleQuantityChange(cardIdNum, -1)}>-</button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button className={styles.controlBtn} onClick={() => handleQuantityChange(cardIdNum, 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};
