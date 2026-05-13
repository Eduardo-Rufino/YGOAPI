'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from './useNavigation';
import { authService } from '@/features/auth/authService';
import { galeraService, Galera } from '@/features/galeras/galeraService';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [galeras, setGaleras] = useState<Galera[]>([]);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

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
    window.addEventListener('focus', syncAuth); // Re-validate when user returns to tab

    const handleGaleraChange = () => {
      setActiveGaleraId(galeraService.getActiveGaleraId());
    };
    window.addEventListener('active-galera-changed', handleGaleraChange);

    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('active-galera-changed', handleGaleraChange);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      galeraService.getMyGaleras().then(g => {
        setGaleras(g);
        const currentActive = galeraService.getActiveGaleraId();
        
        // Se houver galeras e o ID atual não estiver na lista ou não existir, seleciona a primeira
        const isValid = g.some(gal => gal.id === currentActive);
        
        if (g.length > 0 && (!currentActive || !isValid)) {
          galeraService.setActiveGaleraId(g[0].id);
        } else if (g.length === 0) {
          galeraService.setActiveGaleraId(null);
        } else {
          setActiveGaleraId(currentActive);
        }
      });
    } else {
      setGaleras([]);
      setActiveGaleraId(null);
    }
  }, [isLoggedIn]);

  const handleGaleraSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      router.push('/galeras/create');
      return;
    }
    
    if (value) {
      galeraService.setActiveGaleraId(Number(value));
      // Refresh current page to apply new Galera context
      window.location.reload();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername(null);
    setIsAdmin(false);
    closeMenu();
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brandGroup}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          Yu-Gi-Oh! Da Galera 2.0
        </Link>
        {isLoggedIn && (
          <select 
            className={styles.galeraSelect} 
            value={activeGaleraId || ''} 
            onChange={handleGaleraSelect}
            title="Sua Galera Ativa"
          >
            {galeras.length > 0 ? (
              <>
                <optgroup label="Suas Galeras">
                  {galeras.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </optgroup>
                <option value="new">+ Nova Galera</option>
              </>
            ) : (
              <option value="new">+ Criar sua primeira Galera</option>
            )}
          </select>
        )}
      </div>

      <button 
        className={styles.hamburger} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen1 : ''}`}></span>
        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen2 : ''}`}></span>
        <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen3 : ''}`}></span>
      </button>

      <ul className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
        <li>
          <Link
            href="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            onClick={closeMenu}
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
              onClick={closeMenu}
            >
              Painel Admin
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/decks"
            className={`${styles.navLink} ${isActive('/decks') && !isActive('/decks/create') ? styles.active : ''}`}
            onClick={closeMenu}
          >
            Decks
          </Link>
        </li>
        {isLoggedIn && activeGaleraId && (
          <li>
            <Link
              href="/galeras/manage"
              className={`${styles.navLink} ${isActive('/galeras/manage') ? styles.active : ''}`}
              onClick={closeMenu}
            >
              Minha Galera
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/collection"
            className={`${styles.navLink} ${isActive('/collection') ? styles.active : ''}`}
            onClick={closeMenu}
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
                onClick={closeMenu}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className={`${styles.navLink} ${isActive('/register') ? styles.active : ''}`}
                onClick={closeMenu}
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
