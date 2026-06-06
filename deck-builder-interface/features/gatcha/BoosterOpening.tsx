'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { gatchaService } from './gatchaService';
import { deckService, CollectionInfo, Card, Deck } from '@/features/decks/deckService';
import { galeraService } from '@/features/galeras/galeraService';
import { Banner } from './Banner';
import styles from './BoosterOpening.module.css';

interface BoosterOpeningProps {
  variant?: 'store' | 'collections';
}

export const BoosterOpening: React.FC<BoosterOpeningProps> = ({ variant = 'store' }) => {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [starterDecks, setStarterDecks] = useState<CollectionInfo[]>([]);
  const [availableCardsMap, setAvailableCardsMap] = useState<Record<number, number>>({});
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Opening State
  const [isOpening, setIsOpening] = useState(false);
  const [isRipping, setIsRipping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [activeCollection, setActiveCollection] = useState<CollectionInfo | null>(null);

  // View Cards State
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [isStarterDeckView, setIsStarterDeckView] = useState(false);
  const [inspectedCollection, setInspectedCollection] = useState<CollectionInfo | null>(null);
  const [collectionCards, setCollectionCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const collectionData = await deckService.getCollectionsInfo();
      const sortedCollections = [...collectionData.collections].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

      const availability = await Promise.all(
        sortedCollections.map(async (collection) => {
          const cards = await deckService.getCollectionCards(collection.id);
          return [collection.id, cards.reduce((sum, card) => sum + (card.quantity ?? 0), 0)] as const;
        })
      );

      setCollections(sortedCollections);

      const starterDeckData = await deckService.getStarterDecksInfo();
      const sortedStarterDecks = [...starterDeckData.collections].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

      setStarterDecks(sortedStarterDecks);

      setAvailableCardsMap(Object.fromEntries(availability));
      setUserPoints(collectionData.points);
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

  const handleOpenStarterDeck = async (collection: CollectionInfo) => {
    const galeraId = galeraService.getActiveGaleraId();
    if (!galeraId) {
      alert('Nenhuma Galera ativa selecionada!');
      return;
    }

    if (userPoints < collection.price) {
      alert(`Você não tem pontos suficientes nesta Galera! Custo: ${collection.price} pontos.`);
      return;
    }

    setIsOpening(true);
    setIsRipping(false);
    setShowResults(false);
    setActiveCollection(collection);
    setOpenedCards([]);

    try {
      // Começa a carregar as cartas em paralelo com a animação
      const cardsPromise = gatchaService.openStarterDeck(collection.id, galeraId);

      // Espera 1.5 segundos de "suspense" (vibração)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const cards = await cardsPromise;
      setOpenedCards(cards);
      // Espera o rasgo completar antes de mostrar as cartas
      await new Promise(resolve => setTimeout(resolve, 50));

      setShowResults(true);
      // Refresh stock info and points
      loadCollections();
    } catch (err: any) {
      console.error('Failed to open booster', err);
      setError(err.message || 'Erro ao abrir o booster.');
      setIsOpening(false);
    }
  };

  const handleSelectCollection = (collection: CollectionInfo) => {
    const target = document.getElementById(`collection-${collection.id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    window.location.hash = `collection-${collection.id}`;
  };

  const closeOverlay = () => {
    setIsOpening(false);
    setIsRipping(false);
    setShowResults(false);
    setOpenedCards([]);
    setActiveCollection(null);
  };

  const handleViewCards = async (collection: CollectionInfo, isStarterDeck: boolean) => {
    setInspectedCollection(collection);
    setShowCollectionModal(true);
    setIsLoadingCards(true);
    setIsStarterDeckView(isStarterDeck);
    try {
      const cards = await deckService.getCollectionCards(collection.id);
      setCollectionCards(cards);
    } catch (err) {
      console.error('Failed to load collection cards', err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const closeCollectionModal = () => {
    setShowCollectionModal(false);
    setInspectedCollection(null);
    setCollectionCards([]);
  };

  const sortedCollections = useMemo(() => [...collections].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [collections]);
  const latestCollection = sortedCollections[0] ?? null;
  const previewCollections = sortedCollections.slice(0, 4);

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

      {variant === 'store' ? (
        <>
          <Banner collection={latestCollection} onSelectCollection={handleSelectCollection} />

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionLabel}>Open boosters</p>
                <h2 className={styles.sectionTitle}>As 4 últimas coleções disponíveis</h2>
              </div>
              <button className={styles.sectionButton} onClick={() => window.location.assign('/gatcha/collections')}>
                Ver as demais
              </button>
            </div>

            <div className={styles.previewGrid}>
              {previewCollections.map(col => (
                <article key={col.id} className={styles.previewCard}>
                  <img src={col.coverImageUrl || '/CardBack.jpg'} alt={col.name} className={styles.previewCover} />
                  <div className={styles.previewBody}>
                    <p className={styles.previewName}>{col.name}</p>
                    <div className={styles.metricRow}>
                      <span className={styles.metric}>Restantes: {col.remainingStock}</span>
                      <span className={styles.metric}>Disponíveis: {availableCardsMap[col.id] ?? 0}</span>
                    </div>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button className={styles.viewButton} onClick={() => handleViewCards(col, false)}>Ver cartas</button>
                    <button
                      className={styles.openButton}
                      onClick={() => handleOpenBooster(col)}
                      disabled={col.remainingStock < 9 || isOpening || userPoints < col.price}
                    >
                      Abrir booster
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionLabel}>Decks estruturais</p>
                <h2 className={styles.sectionTitle}>Abrir caixa de deck estrutural</h2>
              </div>
            </div>

            <div className={styles.previewGrid}>
              {starterDecks.map(deck => (
                <article key={deck.id} className={styles.previewCard}>
                  <img src={deck.coverImageUrl || '/CardBack.jpg'} alt={deck.name} className={styles.previewCover} />
                  <div className={styles.previewBody}>
                    <p className={styles.previewName}>{deck.name}</p>
                    <p className={styles.previewMeta}> {'Sem data'}</p>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button className={styles.viewButton} onClick={() => handleViewCards(deck, true)}>Ver cartas</button>
                    <button
                      className={styles.openButton}
                      onClick={() => handleOpenStarterDeck(deck)}
                      disabled={userPoints < deck.price}
                    >
                      Abrir Deck estrutural
                    </button>
                  </div>
                </article>
              ))}
              {starterDecks.length === 0 && <p className={styles.emptyState}>Nenhum deck encontrado para exibir.</p>}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Coleções</p>
              <h2 className={styles.sectionTitle}>Todas as coleções disponíveis</h2>
            </div>
            <button className={styles.sectionButton} onClick={() => window.location.assign('/gatcha')}>
              Voltar à loja
            </button>
          </div>

          <div className={styles.grid}>
            {sortedCollections.map(col => (
              <div id={`collection-${col.id}`} key={col.id} className={styles.collectionCard}>
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

                <div className={styles.infoRow}>
                  <span className={styles.infoPill}>Disponíveis: {availableCardsMap[col.id] ?? 0}</span>
                  <span className={styles.infoPill}>Preço: {col.price}</span>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleViewCards(col, false)}
                  >
                    Ver Cartas Disponíveis
                  </button>
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
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Collection Cards Modal */}
      {showCollectionModal && inspectedCollection && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeCollectionModal()}>
          <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '20px', maxWidth: '1200px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className={styles.title} style={{ fontSize: '1.8rem' }}>Cartas em: {inspectedCollection.name}</h2>
              <button className={styles.closeOverlay} style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={closeCollectionModal}>Fechar</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem' }}>
              {isLoadingCards ? (
                <div className={styles.loading} style={{ marginTop: '4rem' }}>
                  <div className={styles.spinner}></div>
                  <p>{isStarterDeckView ? 'Carregando cartas do deck inicial...' : 'Carregando cartas da coleção...'}</p>
                </div>
              ) : collectionCards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {[4, 3, 2, 1, 0].map(rarityLevel => {
                    const group = collectionCards.filter(c => c.rarity === rarityLevel);
                    if (group.length === 0) return null;

                    const rarityColors: Record<number, { bg: string; text: string; border: string }> = {
                      4: { bg: 'rgba(107,33,168,0.25)', text: '#c084fc', border: 'rgba(168,85,247,0.5)' },
                      3: { bg: 'rgba(99,102,241,0.2)', text: '#a5b4fc', border: 'rgba(99,102,241,0.5)' },
                      2: { bg: 'rgba(234,179,8,0.15)', text: '#fde047', border: 'rgba(234,179,8,0.4)' },
                      1: { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.4)' },
                      0: { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8', border: 'rgba(255,255,255,0.1)' },
                    };
                    const color = rarityColors[rarityLevel];

                    return (
                      <div key={rarityLevel}>
                        {/* Rarity Section Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          padding: '0.5rem 1rem',
                          background: color.bg,
                          borderRadius: '8px',
                          border: `1px solid ${color.border}`,
                        }}>
                          <span style={{ color: color.text, fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {getRarityName(rarityLevel)}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {group.length} carta{group.length !== 1 ? 's' : ''}
                            {isStarterDeckView ? '' : ` - ${group.reduce((sum, c) => sum + (c.quantity ?? 0), 0)} disponíveis`}
                          </span>
                        </div>

                        <div className={styles.resultsGrid} style={{ marginTop: 0, perspective: 'none' }}>
                          {group.map((card, idx) => (
                            <div key={`${card.id}-${idx}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ position: 'relative' }}>
                                {/* Stock quantity badge */}
                                <div style={{
                                  position: 'absolute',
                                  top: '6px',
                                  left: '6px',
                                  background: isStarterDeckView ? 'rgba(16,185,129,0.9)' : (card.quantity ?? 0) > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                                  color: '#fff',
                                  fontWeight: 900,
                                  fontSize: '0.75rem',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  zIndex: 10,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                }}>
                                  {isStarterDeckView ? 1 : (card.quantity ?? 0) > 0 ? `x${card.quantity}` : 'Esgotado'}
                                </div>
                                <img
                                  src={card.imageUrl}
                                  alt={card.name}
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/CardBack.jpg'; }}
                                  style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', opacity: isStarterDeckView ? 1 : (card.quantity ?? 0) === 0 ? 0.4 : 1 }}
                                />
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textAlign: 'center', fontWeight: 500 }}>{card.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.error} style={{ marginTop: '2rem' }}>Nenhuma carta encontrada para esta coleção.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
