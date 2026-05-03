'use client';

import React, { useState } from 'react';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { username, password });
    // TODO: Implement actual login logic with API
    alert('Funcionalidade de login ainda não implementada.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Bem-vindo de volta!</h1>
        <p className={styles.subtitle}>Acesse sua conta para gerenciar seus decks</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Usuário</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Digite seu usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Digite sua senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.loginBtn}>
            Entrar
          </button>
        </form>

        <div className={styles.footer}>
          <p>Não tem uma conta? <span className={styles.link}>Criar agora</span></p>
        </div>
      </div>
    </div>
  );
};
