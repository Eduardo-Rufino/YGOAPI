'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from './authService';
import styles from './Login.module.css';

export const Register: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(name, username, password);
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Crie sua conta</h1>
        <p className={styles.subtitle}>Junte-se à maior comunidade de Yu-Gi-Oh!</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Usuário</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Escolha um nome de usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Nome</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Digite seu nome completo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Crie uma senha forte..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirmar Senha</label>
            <input
              type="password"
              className={styles.input}
              placeholder="Repita sua senha..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className={styles.link}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
