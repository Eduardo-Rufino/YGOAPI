'use client';

import React, { useState } from 'react';
import { galeraService } from '@/features/galeras/galeraService';
import styles from '@/features/galeras/Galera.module.css';
import { useRouter } from 'next/navigation';

export default function CreateGaleraPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const novaGalera = await galeraService.createGalera(name);
      galeraService.setActiveGaleraId(novaGalera.id);
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <header>
          <h1 className={styles.title}>Criar Nova Galera</h1>
          <p className={styles.subtitle}>Junte seus amigos para batalhas épicas.</p>
        </header>

        <div className={styles.card}>
          {success && <div className={styles.alert}>Galera criada com sucesso! Redirecionando...</div>}
          <form onSubmit={handleCreate}>
            <div className={styles.inputGroup}>
              <label>Nome da Galera</label>
              <input 
                className={styles.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Duelistas de Elite"
                disabled={loading || success}
              />
            </div>
            <button className={styles.btnSubmit} disabled={!name.trim() || loading || success}>
              {loading ? 'Criando...' : 'Criar Galera'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
