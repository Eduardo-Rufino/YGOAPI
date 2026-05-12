'use client';

import React, { useState, useEffect } from 'react';
import { galeraService, UserGalera } from '@/features/galeras/galeraService';
import styles from '@/features/galeras/Galera.module.css';

export default function RemoveMemberPage() {
  const [members, setMembers] = useState<UserGalera[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
      setMessage('');
      if (newId) fetchMembers(newId);
      else setMembers([]);
    };
    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, []);

  const handleRemove = async (userId: number) => {
    if (!activeGaleraId) return;
    if (!confirm('Tem certeza que deseja remover este membro da galera?')) return;
    
    setLoading(true);
    await galeraService.removeMember(activeGaleraId, userId);
    setMessage('Membro removido com sucesso!');
    await fetchMembers(activeGaleraId); // refresh
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <>
      <div className={styles.container}>
        <header>
          <h1 className={styles.title}>Remover Membro</h1>
          <p className={styles.subtitle}>Gerencie os duelistas da sua galera ativa.</p>
        </header>

        <div className={styles.card}>
          {!activeGaleraId ? (
            <div className={styles.alert}>Nenhuma Galera Ativa selecionada. Selecione uma na barra de navegação superior.</div>
          ) : (
            <>
              {message && <div className={styles.alert}>{message}</div>}
              {loading && members.length === 0 ? (
                <p style={{ color: '#94A3B8' }}>Carregando membros...</p>
              ) : members.length === 0 ? (
                <p style={{ color: '#94A3B8' }}>Nenhum membro encontrado.</p>
              ) : (
                <ul className={styles.list}>
                  {members.map(member => (
                    <li key={member.userId} className={styles.listItem}>
                      <span className={styles.userName}>{member.username}</span>
                      <button className={styles.btnDanger} onClick={() => handleRemove(member.userId)} disabled={loading}>
                        Remover
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
