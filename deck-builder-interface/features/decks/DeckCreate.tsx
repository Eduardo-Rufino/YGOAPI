'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/authService';
import { deckService, Card } from './deckService';
import { playerCollectionService, PlayerCard } from './playerCollectionService';
import { galeraService } from '@/features/galeras/galeraService';
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

interface DeckCreateProps {
  initialDeckId?: string;
}

export const DeckCreate: React.FC<DeckCreateProps> = ({ initialDeckId }) => {
  const router = useRouter();
  
  // Deck State
  const [deckName, setDeckName] = useState('');
  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([]);
  const [deckCover, setDeckCover] = useState<string | null>(null);
  const [isSelectingCover, setIsSelectingCover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Auto-save key
  const STORAGE_KEY = `ygo_deck_draft_${initialDeckId || 'new'}`;

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-save draft logic
  useEffect(() => {
    if (!initialDeckId) {
      const draft = {
        name: deckName,
        cover: deckCover,
        mainDeck,
        extraDeck
      };
      localStorage.setItem('ygo_deck_draft_new', JSON.stringify(draft));
    }
  }, [deckName, deckCover, mainDeck, extraDeck, initialDeckId]);

  // Restore draft on mount
  useEffect(() => {
    if (!initialDeckId) {
      const draft = localStorage.getItem('ygo_deck_draft_new');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setDeckName(parsed.name || '');
          setDeckCover(parsed.cover || '');
          setMainDeck(parsed.mainDeck || []);
          setExtraDeck(parsed.extraDeck || []);
          showNotification('Rascunho recuperado!', 'info');
        } catch (e) {
          console.error('Failed to restore draft', e);
        }
      }
    }
  }, [initialDeckId]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(initialDeckId || null);
  
  // Data State
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [playerCollection, setPlayerCollection] = useState<PlayerCard[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Filter State
  const [searchName, setSearchName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showFullDatabase, setShowFullDatabase] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAtk, setMinAtk] = useState('');
  const [maxAtk, setMaxAtk] = useState('');
  const [minDef, setMinDef] = useState('');
  const [maxDef, setMaxDef] = useState('');
  const [filterAttribute, setFilterAttribute] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterSubType, setFilterSubType] = useState<string>('');
  const [filterRace, setFilterRace] = useState<string>('');
  const [minLevel, setMinLevel] = useState('');
  const [maxLevel, setMaxLevel] = useState('');
  const [filterScale, setFilterScale] = useState('');
  const [filterBanStatus, setFilterBanStatus] = useState('');
  const [filterLinkRating, setFilterLinkRating] = useState('');
  const [filterLinkMarkers, setFilterLinkMarkers] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }
      setIsLoading(true);
      try {
        const activeGaleraId = galeraService.getActiveGaleraId();
        const [cards, colls, pCollection] = await Promise.all([
          deckService.getAvailableCards(0, 10000, activeGaleraId),
          deckService.getCollections(),
          playerCollectionService.getCollection()
        ]);
        setAvailableCards(cards);
        setCollections(colls);
        setPlayerCollection(pCollection);

        if (initialDeckId) {
          // Fetch deck details
          const allDecks = await deckService.getDecks();
          const thisDeck = allDecks.find(d => d.id.toString() === initialDeckId);
          if (thisDeck) {
            setDeckName(thisDeck.name);
            if (thisDeck.deckCover) {
              setDeckCover(thisDeck.deckCover);
            }
          }

          const deckCardsData = await deckService.getDeckCardsData(initialDeckId);
          
          const loadedMainDeck: Card[] = [];
          const loadedExtraDeck: Card[] = [];

          deckCardsData.forEach((dc: any) => {
            const fullCard = cards.find(c => c.id === dc.cardId || c.name === dc.cardName);
            if (fullCard) {
              for (let i = 0; i < dc.quantity; i++) {
                if (isExtraDeckCard(fullCard)) {
                  loadedExtraDeck.push(fullCard);
                } else {
                  loadedMainDeck.push(fullCard);
                }
              }
            }
          });
          setMainDeck(sortCards(loadedMainDeck));
          setExtraDeck(sortCards(loadedExtraDeck));
          showNotification('Deck carregado!', 'success');
        }
      } catch (error) {
        console.error('Init failed:', error);
        showNotification('Erro ao carregar dados.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [initialDeckId]);

  // Filtering Logic
  const filteredCards = useMemo(() => {
    return availableCards.filter(card => {
      // Name
      if (searchName && !card.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      
      // Collection
      if (selectedCollection && card.collection !== selectedCollection) return false;
      
      // ATK Range
      if (minAtk && card.attack < parseInt(minAtk)) return false;
      if (maxAtk && card.attack > parseInt(maxAtk)) return false;
      
      // DEF Range
      if (minDef && card.defense < parseInt(minDef)) return false;
      if (maxDef && card.defense > parseInt(maxDef)) return false;
      
      // Attribute (numeric in API)
      if (filterAttribute && (card.attribute?.toString() ?? '') !== filterAttribute) return false;
      
      // Type & SubType & Race
      if (filterType && (card.type?.toString() ?? '') !== filterType) return false;
      if (filterSubType && (card.subType?.toString() ?? '') !== filterSubType) return false;
      if (filterRace && (card.race?.toString() ?? '') !== filterRace) return false;
      
      // Level Range
      if (minLevel && card.level < parseInt(minLevel)) return false;
      if (maxLevel && card.level > parseInt(maxLevel)) return false;
      
      // Pendulum Scale
      if (filterScale && (card.pendulumScale?.toString() ?? '') !== filterScale) return false;
      
      // Ban Status
      if (filterBanStatus && (card.banStatus?.toString() ?? '') !== filterBanStatus) return false;
      
      // Link Rating
      if (filterLinkRating && (card.linkRating?.toString() ?? '') !== filterLinkRating) return false;
      
      // Link Markers (Card must have ALL selected markers)
      if (filterLinkMarkers.length > 0) {
        if (!card.linkMarkers) return false;
        const cardMarkers = card.linkMarkers.split(',').map(m => m.trim());
        const hasAll = filterLinkMarkers.every(m => cardMarkers.includes(m));
        if (!hasAll) return false;
      }

      // Personal Collection Filter (Show all only if showFullDatabase is true)
      if (!showFullDatabase) {
        const isOwned = card.hasCard || (card.quantity && card.quantity > 0);
        if (!isOwned) return false;
      }

      return true;
    });
  }, [
    availableCards, playerCollection, showFullDatabase, searchName, selectedCollection, 
    minAtk, maxAtk, minDef, maxDef, filterAttribute, 
    filterType, filterSubType, filterRace, minLevel, maxLevel, 
    filterScale, filterBanStatus, filterLinkRating, filterLinkMarkers
  ]);

  const toggleLinkMarker = (marker: string) => {
    setFilterLinkMarkers(prev => 
      prev.includes(marker) ? prev.filter(m => m !== marker) : [...prev, marker]
    );
  };

  const clearFilters = () => {
    setMinAtk(''); setMaxAtk(''); setMinDef(''); setMaxDef('');
    setFilterAttribute(''); setFilterType(''); setFilterSubType(''); setFilterRace('');
    setMinLevel(''); setMaxLevel(''); setFilterScale('');
    setFilterBanStatus(''); setFilterLinkRating(''); setFilterLinkMarkers([]);
  };

  const addCardToDeck = (card: Card) => {
    const ownedQuantity = card.quantity || 0;

    // 2. Check current count in deck (Main + Extra)
    const countInMain = mainDeck.filter(c => c.name === card.name).length;
    const countInExtra = extraDeck.filter(c => c.name === card.name).length;
    const totalInDeck = countInMain + countInExtra;
    
    // 3. Rule check: Game limit (3)
    if (totalInDeck >= 3) {
      showNotification(`Você já possui 3 cópias de ${card.name} no deck!`, 'error');
      return;
    }

    // 4. Ownership check: Personal limit
    // We only allow adding cards if the user is NOT in "Show Full Database" mode
    if (showFullDatabase) {
      showNotification('Modo Banco Global: Adicione esta carta à sua coleção primeiro para usá-la no deck.', 'error');
      return;
    }

    if (totalInDeck >= ownedQuantity) {
      showNotification(`Você possui apenas ${ownedQuantity} cópia(s) de ${card.name} na sua coleção!`, 'error');
      return;
    }

    if (isExtraDeckCard(card)) {
      if (extraDeck.length >= 15) {
        showNotification('O Extra Deck já possui o limite de 15 cartas!', 'error');
        return;
      }
      setExtraDeck(sortCards([...extraDeck, card]));
    } else {
      if (mainDeck.length >= 60) {
        showNotification('O Main Deck já possui o limite de 60 cartas!', 'error');
        return;
      }
      setMainDeck(sortCards([...mainDeck, card]));
    }
  };

  const removeFromMain = (index: number) => {
    if (isSelectingCover) {
      setDeckCover(mainDeck[index].imageUrl);
      setIsSelectingCover(false);
      return;
    }
    const newDeck = [...mainDeck];
    newDeck.splice(index, 1);
    // Already sorted, removing one doesn't break sort order but we keep it consistent
    setMainDeck(sortCards(newDeck));
  };

  const removeFromExtra = (index: number) => {
    if (isSelectingCover) {
      setDeckCover(extraDeck[index].imageUrl);
      setIsSelectingCover(false);
      return;
    }
    const newDeck = [...extraDeck];
    newDeck.splice(index, 1);
    setExtraDeck(sortCards(newDeck));
  };

  const totalCards = mainDeck.length + extraDeck.length;

  const copyToClipboard = () => {
    if (mainDeck.length === 0 && extraDeck.length === 0) {
      showNotification('O deck está vazio!', 'error');
      return;
    }

    let ydkContent = '#main\n';
    mainDeck.forEach(card => {
      ydkContent += `${card.passcode}\n`;
    });

    ydkContent += '#extra\n';
    extraDeck.forEach(card => {
      ydkContent += `${card.passcode}\n`;
    });

    ydkContent += '!side\n';

    navigator.clipboard.writeText(ydkContent).then(() => {
      showNotification('YDK copiado para a área de transferência!', 'success');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      showNotification('Erro ao copiar para o clipboard.', 'error');
    });
  };

  const canSave = mainDeck.length >= 40 && mainDeck.length <= 60 && extraDeck.length <= 15 && deckName.trim() !== '';

  const handleSave = async () => {
    if (!canSave) {
      if (!deckName) showNotification('Dê um nome ao deck!', 'error');
      else if (mainDeck.length < 40) showNotification('Mínimo de 40 cartas no Main Deck!', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await deckService.saveDeck(deckName, [...mainDeck, ...extraDeck], currentDeckId || undefined, deckCover);
      
      // Clear draft on success
      if (!initialDeckId) {
        localStorage.removeItem('ygo_deck_draft_new');
      }
      
      showNotification('Deck salvo com sucesso!', 'success');
      setTimeout(() => router.push('/decks'), 1000);
    } catch (error) {
      console.error('Error saving deck:', error);
      showNotification('Erro ao salvar o deck.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    if (totalCards > 0 && !initialDeckId) {
      if (confirm('Sair? O rascunho será mantido localmente.')) {
        router.push('/decks');
      }
      return;
    }
    router.push('/decks');
  };

  const isHoveredInDeck = hoveredCard && (mainDeck.some(c => c.id === hoveredCard.id) || extraDeck.some(c => c.id === hoveredCard.id));

  return (
    <div className={styles.container}>
      {/* Dynamic Background */}
      {deckCover && (
        <div 
          className={styles.dynamicBg} 
          style={{ backgroundImage: `url(${deckCover})` }}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.topBar}>
        {/* Spacer for alignment with details section */}
        <div className={styles.topBarSpacer}></div>

        {/* Top Left: Controls */}
        <div className={styles.controlsBox}>
          <div className={styles.topRow}>
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
              <span>{totalCards}</span> cartas no total
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.btnSave} onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Deck'}
            </button>
            <button className={styles.btnCopy} onClick={copyToClipboard}>Copiar YDK</button>
            <button 
              className={`${styles.btnSelectCover} ${isSelectingCover ? styles.btnSelectCoverActive : ''}`}
              onClick={() => setIsSelectingCover(!isSelectingCover)}
            >
              {isSelectingCover ? 'Selecione uma carta...' : 'Definir carta capa'}
            </button>
            <button className={styles.btnExit} onClick={handleExit}>Sair</button>
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
            <label className={`${styles.checkboxGroup} ${showFullDatabase ? styles.checkboxActive : ''}`}>
              <input 
                type="checkbox" 
                checked={showFullDatabase}
                onChange={(e) => setShowFullDatabase(e.target.checked)}
              />
              Ver Banco Global
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
            <button 
              className={`${styles.btnMoreFilters} ${showAdvancedFilters ? styles.btnMoreFiltersActive : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Fechar Filtros' : 'Filtros Avançados'}
            </button>
          </div>

          {showAdvancedFilters && (
            <div className={styles.advancedFiltersPanel}>
              <button 
                className={styles.btnCloseFilters} 
                onClick={() => setShowAdvancedFilters(false)}
                title="Fechar"
              >
                ✕
              </button>
              <div className={styles.filterGroup}>
                <label>ATK</label>
                <div className={styles.rangeInputs}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minAtk} 
                    min="0"
                    max={maxAtk !== '' ? maxAtk : undefined}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMinAtk(val);
                        if (maxAtk !== '' && val !== '' && parseInt(val) > parseInt(maxAtk)) {
                          setMaxAtk(val);
                        }
                      }
                    }} 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxAtk} 
                    min={minAtk !== '' ? minAtk : '0'}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMaxAtk(val);
                        if (minAtk !== '' && val !== '' && parseInt(val) < parseInt(minAtk)) {
                          setMinAtk(val);
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <label>DEF</label>
                <div className={styles.rangeInputs}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minDef} 
                    min="0"
                    max={maxDef !== '' ? maxDef : undefined}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMinDef(val);
                        if (maxDef !== '' && val !== '' && parseInt(val) > parseInt(maxDef)) {
                          setMaxDef(val);
                        }
                      }
                    }} 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxDef} 
                    min={minDef !== '' ? minDef : '0'}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMaxDef(val);
                        if (minDef !== '' && val !== '' && parseInt(val) < parseInt(minDef)) {
                          setMinDef(val);
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Level/Rank</label>
                <div className={styles.rangeInputs}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minLevel} 
                    min="0"
                    max={maxLevel !== '' ? maxLevel : undefined}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMinLevel(val);
                        if (maxLevel !== '' && val !== '' && parseInt(val) > parseInt(maxLevel)) {
                          setMaxLevel(val);
                        }
                      }
                    }} 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxLevel} 
                    min={minLevel !== '' ? minLevel : '0'}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || parseInt(val) >= 0) {
                        setMaxLevel(val);
                        if (minLevel !== '' && val !== '' && parseInt(val) < parseInt(minLevel)) {
                          setMinLevel(val);
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>Atributo</label>
                <select value={filterAttribute} onChange={e => setFilterAttribute(e.target.value)} className={styles.selectInput}>
                  <option value="">Todos</option>
                  <option value="1">Luz</option>
                  <option value="2">Trevas</option>
                  <option value="3">Água</option>
                  <option value="4">Fogo</option>
                  <option value="5">Terra</option>
                  <option value="6">Vento</option>
                  <option value="7">Divino</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Tipo (Monstro/Magia...)</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className={styles.selectInput}>
                  <option value="">Todos</option>
                  <option value="0">Monstro</option>
                  <option value="1">Magia</option>
                  <option value="2">Armadilha</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Raça</label>
                <select value={filterRace} onChange={e => setFilterRace(e.target.value)} className={styles.selectInput}>
                  <option value="">Todas</option>
                  <option value="0">Aqua</option>
                  <option value="1">Besta</option>
                  <option value="2">Besta-Guerreira</option>
                  <option value="3">Ciberso</option>
                  <option value="4">Dinossauro</option>
                  <option value="5">Besta Divina</option>
                  <option value="6">Dragão</option>
                  <option value="7">Fada</option>
                  <option value="8">Demônio</option>
                  <option value="9">Peixe</option>
                  <option value="10">Inseto</option>
                  <option value="11">Ilusão</option>
                  <option value="12">Máquina</option>
                  <option value="13">Planta</option>
                  <option value="14">Psíquico</option>
                  <option value="15">Piro</option>
                  <option value="16">Réptil</option>
                  <option value="17">Rocha</option>
                  <option value="18">Serpente Marinha</option>
                  <option value="19">Mago</option>
                  <option value="20">Trovão</option>
                  <option value="21">Guerreiro</option>
                  <option value="22">Besta Alada</option>
                  <option value="23">Wyrm</option>
                  <option value="24">Zumbi</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>BanList</label>
                <select value={filterBanStatus} onChange={e => setFilterBanStatus(e.target.value)} className={styles.selectInput}>
                  <option value="">Qualquer</option>
                  <option value="0">Ilimitada</option>
                  <option value="1">Semi-Limitada</option>
                  <option value="2">Limitada</option>
                  <option value="3">Banida</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Escala Pendulum</label>
                <input 
                  type="number" 
                  placeholder="Escala" 
                  value={filterScale} 
                  min="0"
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || parseInt(val) >= 0) setFilterScale(val);
                  }} 
                  className={styles.rangeInputs} 
                />
              </div>

              <div className={styles.filterGroup}>
                <label>Link Rating</label>
                <input 
                  type="number" 
                  placeholder="Rating" 
                  value={filterLinkRating} 
                  min="0"
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || parseInt(val) >= 0) setFilterLinkRating(val);
                  }} 
                  className={styles.rangeInputs} 
                />
              </div>

              <div className={styles.filterMarkersGroup}>
                <label>Link Markers</label>
                <div className={styles.markersGrid}>
                  {[
                    'Top-Left', 'Top', 'Top-Right',
                    'Left', '', 'Right',
                    'Bottom-Left', 'Bottom', 'Bottom-Right'
                  ].map((m, i) => (
                    m ? (
                      <button 
                        key={m}
                        className={`${styles.markerBtn} ${filterLinkMarkers.includes(m) ? styles.markerBtnActive : ''}`}
                        onClick={() => toggleLinkMarker(m)}
                        title={m}
                      >
                        {i === 0 ? '↖️' : i === 1 ? '⬆️' : i === 2 ? '↗️' : i === 3 ? '⬅️' : i === 5 ? '➡️' : i === 6 ? '↙️' : i === 7 ? '⬇️' : '↘️'}
                      </button>
                    ) : <div key={i} />
                  ))}
                </div>
              </div>

              <button className={styles.btnClearFilters} onClick={clearFilters}>Limpar Filtros</button>
            </div>
          )}
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
                    <img src={card.imageUrlSmall || card.imageUrl} alt={card.name} className={styles.cardImage} />
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
                    <img src={card.imageUrlSmall || card.imageUrl} alt={card.name} className={styles.cardImage} />
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
            {isLoading ? (
              // Skeletons
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))
            ) : (
              filteredCards.map((card, idx) => {
                const ownedQuantity = card.quantity || 0;
                const countInMain = mainDeck.filter(c => c.name === card.name).length;
                const countInExtra = extraDeck.filter(c => c.name === card.name).length;
                const remaining = ownedQuantity - countInMain - countInExtra;

                return (
                <div 
                  key={`db-${idx}`} 
                  className={`${styles.cardItem} ${styles.cardItemDatabase}`} 
                  onClick={() => addCardToDeck(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                >
                  {ownedQuantity > 0 && (
                    <div className={`${styles.ownedBadge} ${remaining <= 0 ? styles.ownedBadgeZero : ''}`}>
                      x{remaining}
                    </div>
                  )}
                  <img src={card.imageUrlSmall || card.imageUrl} alt={card.name} className={styles.cardImage} />
                  <div className={styles.cardInfoBox}>
                    <span className={styles.cardName}>{card.name}</span>
                    <div className={styles.cardStats}>
                      {card.attack} / {card.defense}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
