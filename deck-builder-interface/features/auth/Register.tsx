'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Login.module.css'; // Reusing Login styles for consistency

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    console.log('Register attempt with:', { username, name, password });
    alert('Funcionalidade de registro ainda não implementada.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Crie sua conta</h1>
        <p className={styles.subtitle}>Junte-se à maior comunidade de Yu-Gi-Oh!</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Usuário</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Escolha um nome de usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              required
            />
          </div>

          <button type="submit" className={styles.loginBtn}>
            Cadastrar
          </button>
        </form>

        <div className={styles.footer}>
          <p>Já tem uma conta? <Link href="/login" className={styles.link}>Fazer login</Link></p>
        </div>
      </div>
    </div>
  );
};
