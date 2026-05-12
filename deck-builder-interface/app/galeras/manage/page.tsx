'use client';

import React, { useState, useEffect } from 'react';
import { galeraService, UserGalera } from '@/features/galeras/galeraService';
import styles from '@/features/galeras/Galera.module.css';

export default function ManageGaleraPage() {
  const [members, setMembers] = useState<UserGalera[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: number, username: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);

  const fetchMembers = async (id: number) => {
    setLoading(true);
    const data = await galeraService.getGaleraMembers(id);
    setMembers(data);
    setLoading(false);
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
      setMessage(null);
    };
    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await galeraService.searchUsers(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const handleAdd = async (userId: number) => {
    if (!activeGaleraId) return;
    setLoading(true);
    try {
      await galeraService.addMembers(activeGaleraId, [userId]);
      setMessage({ text: 'Membro adicionado com sucesso!', type: 'success' });
      await fetchMembers(activeGaleraId);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      setMessage({ text: 'Erro ao adicionar membro.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemove = async (userId: number) => {
    if (!activeGaleraId) return;
    if (!confirm('Tem certeza que deseja remover este membro da galera?')) return;
    
    setLoading(true);
    try {
      await galeraService.removeMember(activeGaleraId, userId);
      setMessage({ text: 'Membro removido com sucesso!', type: 'success' });
      await fetchMembers(activeGaleraId);
    } catch (error) {
      setMessage({ text: 'Erro ao remover membro.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>Administração da Galera</h1>
        <p className={styles.subtitle}>Gerencie os membros e as configurações do seu grupo.</p>
      </header>

      <div className={styles.card}>
        {!activeGaleraId ? (
          <div className={styles.alert} style={{ border: '1px solid #FCD34D', color: '#FCD34D', background: 'rgba(252, 211, 77, 0.1)' }}>
            Nenhuma Galera Ativa selecionada. Selecione uma na barra de navegação superior para gerenciar.
          </div>
        ) : (
          <>
            {message && (
              <div className={styles.alert} style={{ 
                border: message.type === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
                color: message.type === 'success' ? '#10B981' : '#EF4444',
                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                marginBottom: '1.5rem'
              }}>
                {message.text}
              </div>
            )}

            <div className={styles.sectionTitle}>
              👥 Membros Atuais
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Usuário</th>
                    <th className={styles.th}>Pontos de Duelo</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.userId}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(138, 43, 226, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {member.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={styles.userName}>{member.username}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{member.duelPoints} pts</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <button className={styles.btnDanger} onClick={() => handleRemove(member.userId)} disabled={loading}>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                        Nenhum membro encontrado nesta galera.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.addSection}>
              <div className={styles.sectionTitle}>
                ➕ Adicionar Novo Membro
              </div>
              
              <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Buscar por nome de usuário</label>
                  <input 
                    className={styles.input}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Ex: yugi_muto..."
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className={styles.btnSubmit} onClick={handleSearch} disabled={loading} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ marginTop: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', padding: '1rem' }}>
                  <ul className={styles.list}>
                    {searchResults.map(user => (
                      <li key={user.id} className={styles.listItem} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 0 }}>
                        <span className={styles.userName}>{user.username}</span>
                        <button className={styles.btnSubmit} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => handleAdd(user.id)} disabled={loading}>
                          Adicionar à Galera
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
