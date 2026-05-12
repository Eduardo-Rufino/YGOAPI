'use client';

import React, { useState, useEffect } from 'react';
import { galeraService } from '@/features/galeras/galeraService';
import styles from '@/features/galeras/Galera.module.css';

export default function AddMemberPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<{id: number, username: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);

  useEffect(() => {
    setActiveGaleraId(galeraService.getActiveGaleraId());
    
    const handleGaleraChange = () => {
      setActiveGaleraId(galeraService.getActiveGaleraId());
      setMessage('');
    };
    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    const results = await galeraService.searchUsers(query);
    setUsers(results);
    setLoading(false);
  };

  const handleAdd = async (userId: number) => {
    if (!activeGaleraId) return;
    setLoading(true);
    await galeraService.addMembers(activeGaleraId, [userId]);
    setMessage('Membro adicionado com sucesso!');
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <div className={styles.container}>
        <header>
          <h1 className={styles.title}>Adicionar Membro</h1>
          <p className={styles.subtitle}>Busque e adicione duelistas à sua galera ativa.</p>
        </header>

        <div className={styles.card}>
          {!activeGaleraId ? (
            <div className={styles.alert}>Nenhuma Galera Ativa selecionada. Selecione uma na barra de navegação superior.</div>
          ) : (
            <>
              {message && <div className={styles.alert}>{message}</div>}
              <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label>Buscar Usuário</label>
                  <input 
                    className={styles.input}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Nome de usuário..."
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className={styles.btnSubmit} onClick={handleSearch} disabled={loading} style={{ width: 'auto', marginBottom: '2px' }}>
                  {loading ? '...' : 'Buscar'}
                </button>
              </div>

              {users.length > 0 && (
                <ul className={styles.list}>
                  {users.map(user => (
                    <li key={user.id} className={styles.listItem}>
                      <span className={styles.userName}>{user.username}</span>
                      <button className={styles.btnSubmit} style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => handleAdd(user.id)} disabled={loading}>
                        Adicionar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
