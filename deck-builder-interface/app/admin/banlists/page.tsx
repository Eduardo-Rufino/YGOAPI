'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/authService';
import { banlistService, BanlistModel, BanlisttDto, CardLimitation } from '@/features/admin/banlistService';
import { deckService, Card } from '@/features/decks/deckService';
import styles from './BanlistAdmin.module.css';
import Link from 'next/link';

export default function BanlistAdminPage() {
  const router = useRouter();

  const [banlists, setBanlists] = useState<BanlistModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [limitations, setLimitations] = useState<CardLimitation[]>([]);

  // Card Search State
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);

  useEffect(() => {
    const user = authService.getUser();
    if (user?.role !== 'Admin' && user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchBanlists();
    fetchCards();
  }, [router]);

  const fetchBanlists = async () => {
    setLoading(true);
    try {
      const data = await banlistService.getBanlists();
      setBanlists(data);
    } catch (err: any) {
      setMessage({ text: 'Erro ao carregar banlists.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const cards = await deckService.getAvailableCards(0, 15000, null);
      setAllCards(cards);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredCards(allCards.filter(c => c.name.toLowerCase().includes(lowerTerm)).slice(0, 10));
    } else {
      setFilteredCards([]);
    }
  }, [searchTerm, allCards]);

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const detail = await banlistService.getBanlist(id);
      if (detail) {
        setName(detail.name);
        setLimitations(detail.banlist || []);
        setEditId(id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ text: 'Banlist não encontrada.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Erro ao buscar detalhes da banlist.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta banlist?')) return;
    try {
      setLoading(true);
      await banlistService.deleteBanlist(id);
      setMessage({ text: 'Banlist excluída com sucesso!', type: 'success' });
      fetchBanlists();
    } catch (err) {
      setMessage({ text: 'Erro ao excluir banlist.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = (cardId: number) => {
    if (limitations.some(l => l.cardId === cardId)) return;
    setLimitations([{ cardId, status: 3 }, ...limitations]); // Default to banned
    setSearchTerm('');
  };

  const handleRemoveCard = (cardId: number) => {
    setLimitations(limitations.filter(l => l.cardId !== cardId));
  };

  const handleStatusChange = (cardId: number, newStatus: number) => {
    setLimitations(limitations.map(l => l.cardId === cardId ? { ...l, status: newStatus } : l));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setMessage({ text: 'O nome da banlist é obrigatório.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const dto: BanlisttDto = { name, banlist: limitations };
      if (editId) {
        await banlistService.editBanlist(editId, dto);
        setMessage({ text: 'Banlist atualizada com sucesso!', type: 'success' });
      } else {
        await banlistService.createBanlist(dto);
        setMessage({ text: 'Banlist criada com sucesso!', type: 'success' });
      }
      handleCancel();
      fetchBanlists();
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao salvar banlist.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setLimitations([]);
    setSearchTerm('');
  };

  const getCardName = (cardId: number) => {
    return allCards.find(c => c.id === cardId.toString())?.name || `ID: ${cardId}`;
  };

  return (
    <div className={styles.container}>
      <div>
        <Link href="/admin" style={{ color: '#94A3B8', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
          &larr; Voltar para Painel Admin
        </Link>
        <h1 className={styles.title}>Gerenciar Banlists</h1>
        <p className={styles.subtitle}>Crie e edite as regras de banimento para as competições.</p>
      </div>

      {message && (
        <div className={styles.alert} style={{ 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: message.type === 'success' ? '#10B981' : '#EF4444',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Form Card */}
      <div className={styles.card}>
        <h2 style={{ color: '#F8FAFC', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {isEditing ? 'Editar Banlist' : 'Nova Banlist'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Nome da Banlist</label>
            <input 
              type="text" 
              className={styles.input} 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="Ex: TCG Setembro 2024"
              required
            />
          </div>

          <div className={styles.cardSearchSection}>
            <div className={styles.inputGroup}>
              <label>Adicionar Carta à Lista</label>
              <input 
                type="text" 
                className={styles.input} 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Busque pelo nome da carta (min. 3 letras)..."
              />
            </div>
            {filteredCards.length > 0 && (
              <ul className={styles.list} style={{ marginBottom: '1rem', background: '#0F172A', padding: '0.5rem', borderRadius: '8px' }}>
                {filteredCards.map(c => (
                  <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#E2E8F0' }}>{c.name}</span>
                    <button 
                      type="button" 
                      className={styles.btnSecondary} 
                      onClick={() => handleAddCard(Number(c.id))}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      + Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {limitations.length > 0 && (
              <div className={styles.addedCardsList}>
                <h4 style={{ color: '#94A3B8', marginBottom: '0.5rem' }}>Cartas na Lista ({limitations.length}):</h4>
                {limitations.map(lim => (
                  <div key={lim.cardId} className={styles.addedCardItem}>
                    <span className={styles.cardName}>{getCardName(lim.cardId)}</span>
                    <select 
                      className={styles.select}
                      value={lim.status}
                      onChange={(e) => handleStatusChange(lim.cardId, Number(e.target.value))}
                      style={{
                        color: lim.status === 3 ? '#EF4444' : lim.status === 2 ? '#F59E0B' : lim.status === 1 ? '#10B981' : '#94A3B8'
                      }}
                    >
                      <option value={3}>Proibida</option>
                      <option value={2}>Limitada</option>
                      <option value={1}>Semi-Limitada</option>
                      <option value={0}>Ilimitada</option>
                    </select>
                    <button 
                      type="button" 
                      className={styles.btnDanger}
                      onClick={() => handleRemoveCard(lim.cardId)}
                      title="Remover da lista"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {isEditing && (
              <button type="button" className={styles.btnSecondary} onClick={handleCancel}>
                Cancelar
              </button>
            )}
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Banlist')}
            </button>
          </div>
        </form>
      </div>

      {/* List Card */}
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h2 style={{ color: '#F8FAFC', fontSize: '1.5rem', margin: 0 }}>Banlists Cadastradas</h2>
        </div>
        {loading && !isEditing ? (
          <p style={{ color: '#94A3B8' }}>Carregando...</p>
        ) : banlists.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>Nenhuma banlist encontrada.</p>
        ) : (
          <ul className={styles.list}>
            {banlists.map(b => (
              <li key={b.id} className={styles.listItem}>
                <span className={styles.banlistName}>{b.name}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.btnSecondary} onClick={() => handleEdit(b.id)}>
                    Editar
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(b.id)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
