'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/authService';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getUser();
    if (user?.role !== 'Admin' && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [router]);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FCD34D', marginBottom: '0.5rem' }}>Painel Admin</h1>
      <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Escolha uma ferramenta administrativa abaixo.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Importador de Cartas */}
        <Link href="/admin/import" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(252, 211, 77, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
            e.currentTarget.style.borderColor = '#FCD34D';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(252, 211, 77, 0.3)';
            e.currentTarget.style.transform = 'none';
          }}>
            <h2 style={{ color: '#E2E8F0', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📥 Importador de Cartas
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Busque cartas da API oficial do Yu-Gi-Oh! e importe para o banco de dados da aplicação.
            </p>
          </div>
        </Link>

        {/* Gerenciar Banlists */}
        <Link href="/admin/banlists" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
            e.currentTarget.style.borderColor = '#EF4444';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.transform = 'none';
          }}>
            <h2 style={{ color: '#E2E8F0', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚫 Gerenciar Banlists
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Crie novas listas de banimento, defina o status (Banida, Limitada, Semi-Limitada) e associe às competições.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
