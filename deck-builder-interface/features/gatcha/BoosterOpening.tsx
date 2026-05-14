'use client';

import React, { useState, useEffect } from 'react';
import { gatchaService } from './gatchaService';
import { deckService, CollectionInfo, Card } from '@/features/decks/deckService';
import { galeraService } from '@/features/galeras/galeraService';
import styles from './BoosterOpening.module.css';

export const BoosterOpening: React.FC = () => {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Opening State
  const [isOpening, setIsOpening] = useState(false);
  const [isRipping, setIsRipping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [activeCollection, setActiveCollection] = useState<CollectionInfo | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await deckService.getCollectionsInfo();
      setCollections(data.collections);
      setUserPoints(data.points);
    } catch (err) {
      console.error('Failed to load collections', err);
      setError('Erro ao carregar coleções disponíveis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBooster = async (collection: CollectionInfo) => {
    const galeraId = galeraService.getActiveGaleraId();
    if (!galeraId) {
      alert('Nenhuma Galera ativa selecionada!');
      return;
    }

    if (collection.remainingStock < 9) {
      alert('Não há cartas suficientes nesta coleção!');
      return;
    }

    if (userPoints < collection.price) {
      alert(`Você não tem pontos suficientes nesta Galera! Custo: ${collection.price} pontos.`);
      return;
    }

    setIsOpening(true);
    setIsRipping(true);
    setShowResults(false);
    setActiveCollection(collection);
    setOpenedCards([]);

    try {
      // Começa a carregar as cartas em paralelo com a animação
      const cardsPromise = gatchaService.openBooster(collection.id, galeraId);

      // Espera 1.5 segundos de "suspense" (vibração)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const cards = await cardsPromise;
      setOpenedCards(cards);

      // Inicia a animação de rasgar (0.8s no CSS)
      setIsRipping(false); 

      // Espera o rasgo completar antes de mostrar as cartas
      await new Promise(resolve => setTimeout(resolve, 800));

      setShowResults(true);
      // Refresh stock info and points
      loadCollections();
    } catch (err: any) {
      console.error('Failed to open booster', err);
      setError(err.message || 'Erro ao abrir o booster.');
      setIsOpening(false);
      setIsRipping(false);
    }
  };

  const closeOverlay = () => {
    setIsOpening(false);
    setIsRipping(false);
    setShowResults(false);
    setOpenedCards([]);
    setActiveCollection(null);
  };

  const getRarityClass = (rarity: number) => {
    switch (rarity) {
      case 2: return styles.superRare;
      case 3: return styles.ultraRare;
      case 4: return styles.secretRare;
      default: return '';
    }
  };

  const getRarityName = (rarity: number) => {
    switch (rarity) {
      case 0: return 'Common';
      case 1: return 'Rare';
      case 2: return 'Super Rare';
      case 3: return 'Ultra Rare';
      case 4: return 'Secret Rare';
      default: return 'Unknown';
    }
  };

  if (isLoading && collections.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando coleções...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Abertura de Boosters</h1>
          <div className={styles.pointsBadge}>
            <span className={styles.pointsLabel}>Seus Pontos (Galera)</span>
            <span className={styles.pointsValue}>{userPoints}</span>
          </div>
        </div>
        <p className={styles.subtitle}>
          Cada booster contém 9 cartas aleatórias da coleção selecionada.
          O estoque é compartilhado entre todos os membros da galera!
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {collections.map(col => (
          <div key={col.id} className={styles.collectionCard}>
            <div className={styles.priceTag}>
              {col.price} {col.price === 1 ? 'Ponto' : 'Pontos'}
            </div>
            {col.coverImageUrl && (
              <div className={styles.coverWrapper}>
                <img src={col.coverImageUrl} alt={col.name} className={styles.coverImage} />
              </div>
            )}
            <div className={styles.collectionName}>{col.name}</div>

            <div className={styles.stockInfo}>
              <span className={styles.stockLabel}>Cartas Restantes</span>
              <span className={styles.stockCount}>{col.remainingStock}</span>
            </div>

            <button
              className={styles.openButton}
              onClick={() => handleOpenBooster(col)}
              disabled={col.remainingStock < 9 || isOpening || userPoints < col.price}
            >
              {col.remainingStock < 9 ? 'Esgotado' : 
               userPoints < col.price ? 'Pontos Insuficientes' : 
               'Abrir Booster'}
            </button>
          </div>
        ))}
      </div>

      {isOpening && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeOverlay()}>
          {!showResults ? (
            <div className={styles.loading}>
              <img
                src={activeCollection?.coverImageUrl}
                alt="Booster"
                className={`${styles.boosterPreview} ${isRipping ? styles.boosterShake : styles.boosterRip}`}
              />
              <p className={styles.title}>{isRipping ? 'Preparando Booster...' : 'Abrindo!'}</p>
            </div>
          ) : (
            <>
              <h2 className={styles.title}>Resultados</h2>
              <p className={styles.subtitle}>{activeCollection?.name}</p>

              <div className={styles.resultsGrid}>
                {openedCards.map((card, idx) => (
                  <div
                    key={`${card.id}-${idx}`}
                    className={`${styles.cardReveal} ${getRarityClass(card.rarity)}`}
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <span className={styles.rarityBadge}>{getRarityName(card.rarity)}</span>
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </div>
                ))}
              </div>

              <button className={styles.closeOverlay} onClick={closeOverlay}>
                Continuar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
