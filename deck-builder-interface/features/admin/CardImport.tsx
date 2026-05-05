'use client';

import React, { useState, useEffect } from 'react';
import { adminService, YgoProDeckCardDto } from './adminService';
import { authService } from '../auth/authService';
import { useRouter } from 'next/navigation';
import styles from './CardImport.module.css';

export const CardImport: React.FC = () => {
  const [setName, setSetName] = useState('');
  const [cards, setCards] = useState<YgoProDeckCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = authService.getUser();
    // Simplified check: usually we'd check a specific claim, 
    // but here we check if user exists and has a nameid/id
    if (!user) {
      router.push('/');
      return;
    }
    // In a real scenario, we'd check a 'Role' claim. 
    // For now, let's assume the user is authorized if they reach this protected route,
    // but the API will enforce the 'Admin' policy anyway.
    setIsAdmin(true);
  }, [router]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSearch = async () => {
    if (!setName.trim()) return;
    
    setIsLoading(true);
    setCards([]);
    try {
      const data = await adminService.fetchSetPreview(setName);
      setCards(data);
      if (data.length === 0) {
        showNotification('Nenhuma carta encontrada para esta coleção.', 'error');
      }
    } catch (error: any) {
      showNotification(error.message || 'Erro ao buscar coleção.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (cards.length === 0) return;

    setIsImporting(true);
    try {
      await adminService.confirmImport(cards);
      showNotification(`${cards.length} cartas importadas com sucesso!`, 'success');
      setCards([]);
      setSetName('');
    } catch (error: any) {
      showNotification(error.message || 'Erro ao importar cartas.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setCards([]);
    setSetName('');
  };

  if (!isAdmin) return null;

  return (
    <div className={styles.container}>
      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>Importador de Cartas</h1>
        <p className={styles.subtitle}>Dashboard Administrativo para expansão do Banco de Dados</p>
      </header>

      <section className={styles.searchBox}>
        <div className={styles.inputGroup}>
          <label>Nome da Coleção (YgoProDeck)</label>
          <input 
            type="text" 
            className={styles.input}
            placeholder="Ex: Legend of Blue Eyes White Dragon"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button 
          className={styles.btnSearch} 
          onClick={handleSearch} 
          disabled={isLoading || !setName.trim()}
        >
          {isLoading ? 'Buscando...' : 'Buscar Coleção'}
        </button>
      </section>

      {cards.length > 0 && (
        <section className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3>Preview: {cards.length} cartas encontradas</h3>
            <div className={styles.actionGroup}>
              <button 
                className={styles.btnCancel} 
                onClick={handleCancel}
                disabled={isImporting}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnConfirm} 
                onClick={handleConfirm}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : 'Confirmar Inclusão'}
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {cards.map((card: any, index: number) => {
              // Try multiple ways to find the image URL
              const imgUrl = card.card_images?.[0]?.image_url 
                || card.cardImages?.[0]?.imageUrl 
                || card.imageUrl;

              return (
                <div key={card.id || index} className={styles.cardItem}>
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={card.name} 
                      className={styles.cardImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-card.png';
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>Sem Imagem</div>
                  )}
                  <div className={styles.cardName}>{card.name}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
