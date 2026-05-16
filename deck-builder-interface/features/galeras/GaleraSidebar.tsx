'use client';

import React, { useState, useEffect } from 'react';
import { galeraService, UserGalera } from './galeraService';
import { Card } from '@/features/decks/deckService';
import { authService } from '@/features/auth/authService';
import { API_BASE_URL } from '@/features/config';
import styles from './GaleraSidebar.module.css';

interface MemberCollectionModalProps {
  member: UserGalera;
  onClose: () => void;
}

const MemberCollectionModal: React.FC<MemberCollectionModalProps> = ({ member, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member.userId) {
      console.error('Member userId is missing', member);
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      setLoading(true);
      try {
        const activeGaleraId = galeraService.getActiveGaleraId();
        const url = `${API_BASE_URL}/Card?userId=${member.userId}&galeraId=${activeGaleraId}&take=10000`;
        
        const response = await fetch(url, {
          headers: {
            ...authService.getAuthHeaders()
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Filtrar cartas que o usuário possui
          const filtered = data.filter((c: any) => {
            const has = c.hasCard ?? c.HasCard;
            const qty = c.quantity ?? c.Quantity;
            return has === true || has === 1 || has === "true" || (qty && qty > 0);
          });
          
          const mapped: Card[] = filtered.map((c: any) => ({
            id: c.id ?? c.Id,
            name: c.name ?? c.Name,
            imageUrl: c.imageUrl ?? c.ImageUrl,
            imageUrlSmall: c.imageUrlSmall ?? c.ImageUrlSmall,
            collection: c.collection ?? c.Collection,
            effect: c.effect ?? c.Effect,
            quantity: c.quantity ?? c.Quantity
          } as Card));

          setCards(mapped);
        } else {
          console.error('Erro na resposta da API:', response.status);
        }
      } catch (error) {
        console.error('Erro ao processar modal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [member.userId]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>Coleção de {member.username} ({cards.length})</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </header>
        
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>Carregando coleção...</div>
          ) : cards.length > 0 ? (
            <div className={styles.cardGrid}>
              {cards.map((card, idx) => (
                <div key={card.id || idx} className={styles.cardItem}>
                  <div className={styles.cardWrapper}>
                    {card.quantity && card.quantity > 0 && (
                      <div className={styles.ownedBadge}>x{card.quantity}</div>
                    )}
                    <img 
                      src={card.imageUrl || '/CardBack.jpg'} 
                      alt={card.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/CardBack.jpg';
                      }}
                    />
                  </div>
                  <div className={styles.cardName}>{card.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyMessage}>
              Nenhuma carta encontrada para este membro nesta galera.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const GaleraSidebar: React.FC = () => {
  const [members, setMembers] = useState<UserGalera[]>([]);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<UserGalera | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const fetchMembers = async (id: number) => {
    const data = await galeraService.getGaleraMembers(id);
    setMembers(data);
  };

  useEffect(() => {
    const id = galeraService.getActiveGaleraId();
    setActiveGaleraId(id);
    if (id) fetchMembers(id);

    const handleGaleraChange = () => {
      const newId = galeraService.getActiveGaleraId();
      setActiveGaleraId(newId);
      if (newId) fetchMembers(newId);
      else setMembers([]);
    };

    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  // Responsividade: fechar automaticamente em telas menores ao carregar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeGaleraId) return null;

  return (
    <>
      <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Recolher Membros" : "Expandir Membros"}
        >
          {isOpen ? '◀' : '▶'}
        </button>
        <div className={styles.sidebarContent}>
          <h3 className={styles.sidebarTitle}>Membros da Galera</h3>
          <ul className={styles.memberList}>
            {members.map(member => (
              <li 
                key={member.userId} 
                className={styles.memberItem}
                onClick={() => setSelectedMember(member)}
              >
                <span className={styles.memberStatus}></span>
                {member.username}
              </li>
            ))}
            {members.length === 0 && (
              <li className={styles.emptyMembers}>Nenhum membro</li>
            )}
          </ul>
        </div>
      </aside>

      {selectedMember && (
        <MemberCollectionModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </>
  );
};
