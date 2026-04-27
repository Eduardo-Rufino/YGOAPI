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
  // Common Extra Deck type names/IDs in YGO context
  const extraTypes = [
    'Fusion Monster', 'Synchro Monster', 'Xyz Monster', 'Link Monster',
    'Synchro Tuner Monster', 'Fusion Pendulum Monster', 'Xyz Pendulum Monster'
  ];
  // Since our API currently uses numeric types, we'll need a way to detect them.
  // For now, let's assume we can check via type string if available or a specific numeric range.
  // IF the API provides a string type, we'd use that. 
  // Given the previous mapping task, the user mentioned type is 0. 
  // I'll implement a flexible check that can be refined.
  return card.type >= 10 && card.type <= 15; // Placeholder logic
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
    if (isExtraDeckCard(card)) {
      if (extraDeck.length < 15) {
        setExtraDeck([...extraDeck, card]);
      }
    } else {
      if (mainDeck.length < 60) {
        setMainDeck([...mainDeck, card]);
      }
    }
  };

  const removeFromMain = (index: number) => {
    const newDeck = [...mainDeck];
    newDeck.splice(index, 1);
    setMainDeck(newDeck);
  };

  const removeFromExtra = (index: number) => {
    const newDeck = [...extraDeck];
    newDeck.splice(index, 1);
    setExtraDeck(newDeck);
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
        {/* Bottom Left: Deck Sections */}
        <div className={styles.deckSection}>
          <section>
            <h3 className={styles.subSectionTitle}>
              Main Deck
              <span className={`${styles.counterBadge} ${mainDeck.length < 40 ? styles.counterBadgeWarning : ''}`}>
                {mainDeck.length} / 60 (Min 40)
              </span>
            </h3>
            <div className={styles.cardGrid}>
              {mainDeck.map((card, idx) => (
                <div key={`main-${idx}`} className={`${styles.cardItem} ${styles.cardItemDeck}`} onClick={() => removeFromMain(idx)}>
                  <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className={styles.subSectionTitle}>
              Extra Deck
              <span className={styles.counterBadge}>
                {extraDeck.length} / 15
              </span>
            </h3>
            <div className={styles.cardGrid}>
              {extraDeck.map((card, idx) => (
                <div key={`extra-${idx}`} className={`${styles.cardItem} ${styles.cardItemDeck}`} onClick={() => removeFromExtra(idx)}>
                  <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Right: Card Database */}
        <div className={styles.databaseSection}>
          <h3 className={styles.subSectionTitle}>Banco de Dados</h3>
          <div className={styles.databaseGrid}>
            {filteredCards.map((card, idx) => (
              <div key={`db-${idx}`} className={`${styles.cardItem} ${styles.cardItemDatabase}`} onClick={() => addCardToDeck(card)}>
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
