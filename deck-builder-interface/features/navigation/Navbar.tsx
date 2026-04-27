'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigation } from './useNavigation';
import styles from './Navbar.module.css';

/**
 * Reusable Navbar component.
 * Uses the useNavigation hook for logic.
 */
export const Navbar: React.FC = () => {
  const { isActive } = useNavigation();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Nexus
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
            href="/about" 
            className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};
