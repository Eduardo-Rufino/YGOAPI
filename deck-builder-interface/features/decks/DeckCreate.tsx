'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deckService, Card } from './deckService';
import styles from './DeckCreate.module.css';

/**
 * Utility to determine if a card belongs to the Extra Deck.
 * For this implementation, we assume certain type IDs represent Extra Deck cards.
 * (Adjust according to actual YGOAPI type mapping if known)
 */
const isExtraDeckCard = (card: Card) => {
  // Logic: if Type is 0 and subType is 2, 4, 5 or 6, it belongs to the Extra Deck
  const extraSubTypes = [2, 4, 5, 6];
  return card.type === 0 && extraSubTypes.includes(card.subType);
};

/**
 * Utility to sort cards by Type (priority) and then Name.
 */
const sortCards = (cards: Card[]) => {
  return [...cards].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type - b.type;
    }
    return a.name.localeCompare(b.name);
  });
};

export const DeckCreate: React.FC = () => {
  const router = useRouter();
  
  // Deck State
  const [deckName, setDeckName] = useState('');
  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([]);
  
  // Data State
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Filter State
  const [searchName, setSearchName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [personalOnly, setPersonalOnly] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  useEffect(() => {
    const init = async () => {
      const [cards, colls] = await Promise.all([
        deckService.getAvailableCards(),
        deckService.getCollections()
      ]);
      setAvailableCards(cards);
      setCollections(colls);
    };
    init();
  }, []);

  // Filtering Logic (Client-side for 50-100 cards)
  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      const matchesName = card.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesCollection = !selectedCollection || card.collection === selectedCollection;
      // In this mock/limited API, personalOnly might not be fully supported, but we'll implement the toggle logic
      return matchesName && matchesCollection;
    });
  }, [availableCards, searchName, selectedCollection]);

  const addCardToDeck = (card: Card) => {
    // Check for 3 copy limit by name (standard YGO rule)
    const currentCopies = [...mainDeck, ...extraDeck].filter(c => c.name === card.name).length;
    if (currentCopies >= 3) {
      alert(`Limite atingido: Você já possui 3 cópias de "${card.name}" no deck.`);
      return;
    }

    if (isExtraDeckCard(card)) {
      if (extraDeck.length < 15) {
        setExtraDeck(sortCards([...extraDeck, card]));
      }
    } else {
      if (mainDeck.length < 60) {
        setMainDeck(sortCards([...mainDeck, card]));
      }
    }
  };

  const removeFromMain = (index: number) => {
    const newDeck = [...mainDeck];
    newDeck.splice(index, 1);
    // Already sorted, removing one doesn't break sort order but we keep it consistent
    setMainDeck(sortCards(newDeck));
  };

  const removeFromExtra = (index: number) => {
    const newDeck = [...extraDeck];
    newDeck.splice(index, 1);
    setExtraDeck(sortCards(newDeck));
  };

  const totalCards = mainDeck.length + extraDeck.length;
  const canSave = mainDeck.length >= 40 && mainDeck.length <= 60 && extraDeck.length <= 15 && deckName.trim() !== '';

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await deckService.saveDeck(deckName, [...mainDeck, ...extraDeck]);
      router.push('/decks');
    } catch (error) {
      console.error('Error saving deck:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    if (totalCards > 0 && !confirm('Sair sem salvar? Alterações serão perdidas.')) return;
    router.push('/decks');
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        {/* Spacer for alignment with details section */}
        <div className={styles.topBarSpacer}></div>

        {/* Top Left: Controls */}
        <div className={styles.controlsBox}>
          <div className={styles.actionButtons}>
            <button className={styles.btnSave} onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Deck'}
            </button>
            <button className={styles.btnExit} onClick={handleExit}>Sair</button>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nome do Deck</label>
            <input 
              type="text" 
              className={styles.deckNameInput}
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Digite o nome..."
            />
          </div>
          <div className={styles.totalCounter}>
            Total: {totalCards} cartas
          </div>
        </div>

        {/* Top Right: Filters */}
        <div className={styles.filtersBox}>
          <div className={styles.filterRow}>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Pesquisar carta por nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <label className={styles.checkboxGroup}>
              <input 
                type="checkbox" 
                checked={personalOnly}
                onChange={(e) => setPersonalOnly(e.target.checked)}
              />
              Coleção Pessoal
            </label>
          </div>
          <div className={styles.filterRow}>
            <select 
              className={styles.selectInput}
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
            >
              <option value="">Todas as Coleções</option>
              {collections.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className={styles.btnMoreFilters}>Filtros Avançados</button>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Left: Card Details Panel */}
        <div className={styles.detailsSection}>
          {hoveredCard ? (
            <div className={styles.detailsContent}>
              <div className={styles.detailsTitle}>{hoveredCard.name}</div>
              <img 
                src={hoveredCard.imageUrl} 
                alt={hoveredCard.name} 
                className={styles.detailsImage} 
              />
              <div className={styles.detailsStats}>
                {hoveredCard.attack} / {hoveredCard.defense}
              </div>
              <div className={styles.detailsEffect}>
                {hoveredCard.effect || 'Sem efeito.'}
              </div>
            </div>
          ) : (
            <div className={styles.detailsEmpty}>
              Passe o mouse sobre uma carta para ver os detalhes
            </div>
          )}
        </div>

        {/* Bottom Center: Deck Sections */}
        <div className={styles.deckSection}>
          <div className={styles.mainDeckContainer}>
            <section>
              <h3 className={styles.subSectionTitle}>
                Main Deck
                <span className={`${styles.counterBadge} ${mainDeck.length < 40 ? styles.counterBadgeWarning : ''}`}>
                  {mainDeck.length} / 60 (Min 40)
                </span>
              </h3>
              <div className={styles.cardGrid}>
                {mainDeck.map((card, idx) => (
                  <div 
                    key={`main-${idx}`} 
                    className={`${styles.cardItem} ${styles.cardItemDeck}`} 
                    onClick={() => removeFromMain(idx)}
                    onMouseEnter={() => setHoveredCard(card)}
                  >
                    <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.extraDeckContainer}>
            <section>
              <h3 className={styles.subSectionTitle}>
                Extra Deck
                <span className={styles.counterBadge}>
                  {extraDeck.length} / 15
                </span>
              </h3>
              <div className={styles.extraDeckGrid}>
                {extraDeck.map((card, idx) => (
                  <div 
                    key={`extra-${idx}`} 
                    className={`${styles.cardItem} ${styles.cardItemDeck}`} 
                    onClick={() => removeFromExtra(idx)}
                    onMouseEnter={() => setHoveredCard(card)}
                  >
                    <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Right: Card Database */}
        <div className={styles.databaseSection}>
          <h3 className={styles.subSectionTitle}>Banco de Dados</h3>
          <div className={styles.databaseGrid}>
            {filteredCards.map((card, idx) => (
              <div 
                key={`db-${idx}`} 
                className={`${styles.cardItem} ${styles.cardItemDatabase}`} 
                onClick={() => addCardToDeck(card)}
                onMouseEnter={() => setHoveredCard(card)}
              >
                <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                <div className={styles.cardInfoBox}>
                  <span className={styles.cardName}>{card.name}</span>
                  <div className={styles.cardStats}>
                    {card.attack} / {card.defense}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
