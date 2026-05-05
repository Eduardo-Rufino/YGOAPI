'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from './useNavigation';
import { authService } from '@/features/auth/authService';
import styles from './Navbar.module.css';

/**
 * Reusable Navbar component.
 * Uses the useNavigation hook for logic and authService for auth state.
 */
export const Navbar: React.FC = () => {
  const { isActive } = useNavigation();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync auth state on mount and when localStorage changes (e.g. after login/logout)
  useEffect(() => {
    const syncAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setUsername(authService.getUsername());
      
      const user = authService.getUser();
      setIsAdmin(user?.role === 'ADMIN');
    };

    syncAuth();

    // Listen for auth changes dispatched by authService (same-tab) and storage (cross-tab)
    window.addEventListener('auth-change', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Yu-Gi-Oh! Da Galera 2.0
      </Link>

      <ul className={styles.navLinks}>
        <li>
          <Link
            href="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            Home
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link
              href="/admin/import"
              className={`${styles.navLink} ${isActive('/admin/import') ? styles.active : ''}`}
              style={{ color: '#FCD34D' }} // Gold-ish for admin
            >
              Painel Admin
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/decks"
            className={`${styles.navLink} ${isActive('/decks') && !isActive('/decks/create') ? styles.active : ''}`}
          >
            Decks
          </Link>
        </li>
        <li>
          <Link
            href="/decks/create"
            className={`${styles.navLink} ${isActive('/decks/create') ? styles.active : ''}`}
          >
            Create Deck
          </Link>
        </li>
        <li>
          <Link
            href="/collection"
            className={`${styles.navLink} ${isActive('/collection') ? styles.active : ''}`}
          >
            Minha Coleção
          </Link>
        </li>

        {isLoggedIn ? (
          <>
            <li className={styles.navUser}>
              👤 {username}
            </li>
            <li>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Sair
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className={`${styles.navLink} ${isActive('/register') ? styles.active : ''}`}
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
