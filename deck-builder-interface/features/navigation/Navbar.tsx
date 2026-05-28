'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from './useNavigation';
import { authService } from '@/features/auth/authService';
import { galeraService, Galera } from '@/features/galeras/galeraService';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { isActive } = useNavigation();
  const router = useRouter();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [galeras, setGaleras] = useState<Galera[]>([]);
  const [activeGalera, setActiveGalera] = useState<Galera | null>(null);
  
  // Dropdown states
  const [isGaleraDropdownOpen, setIsGaleraDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsGaleraDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  useEffect(() => {
    const syncAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setUsername(authService.getUsername());
    };

    syncAuth();
    window.addEventListener('auth-change', syncAuth);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('auth-change', syncAuth);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      galeraService.getMyGaleras().then(g => {
        setGaleras(g);
        const currentActiveId = galeraService.getActiveGaleraId();
        const validActive = g.find(gal => gal.id === currentActiveId);
        
        if (g.length > 0 && !validActive) {
          galeraService.setActiveGaleraId(g[0].id);
          setActiveGalera(g[0]);
        } else if (validActive) {
          setActiveGalera(validActive);
        } else {
          setActiveGalera(null);
        }
      });
    } else {
      setGaleras([]);
      setActiveGalera(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGaleraSelect = (id: number) => {
    galeraService.setActiveGaleraId(id);
    closeAllMenus();
    window.location.reload();
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername(null);
    closeAllMenus();
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      
      {/* ── Left Side: Navigation Links ── */}
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo} onClick={closeAllMenus}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>YD2</span>
        </Link>
        
        <button 
          className={styles.hamburger} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen1 : ''}`}></span>
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen2 : ''}`}></span>
          <span className={`${styles.bar} ${isMobileMenuOpen ? styles.barOpen3 : ''}`}></span>
        </button>

        <ul className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
          <li>
            <Link href="/decks" className={`${styles.navLink} ${isActive('/decks') ? styles.active : ''}`} onClick={closeAllMenus}>
              Decks
            </Link>
          </li>
          <li>
            <Link href="/collection" className={`${styles.navLink} ${isActive('/collection') ? styles.active : ''}`} onClick={closeAllMenus}>
              Cartas
            </Link>
          </li>
          <li>
            <Link href="/gatcha" className={`${styles.navLink} ${isActive('/gatcha') ? styles.active : ''}`} onClick={closeAllMenus}>
              Loja
            </Link>
          </li>
        </ul>
      </div>

      {/* ── Center: Galera Menu ── */}
      <div className={styles.centerSection}>
        {isLoggedIn && (
          <div 
            className={styles.galeraMenuWrapper}
            onMouseEnter={() => setIsGaleraDropdownOpen(true)}
            onMouseLeave={() => setIsGaleraDropdownOpen(false)}
          >
            <button className={styles.galeraButton}>
              <span className={styles.galeraIcon}>◈</span>
              {activeGalera ? activeGalera.name : 'Selecionar Galera'}
              <span className={styles.chevron}>▼</span>
            </button>
            
            {isGaleraDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>Minhas galeras</div>
                {galeras.map(g => (
                  <button 
                    key={g.id} 
                    className={`${styles.dropdownItem} ${activeGalera?.id === g.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleGaleraSelect(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
                <div className={styles.dropdownDivider}></div>
                <Link href="/galeras/create" className={styles.dropdownItemAction} onClick={closeAllMenus}>
                  + Criar nova
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right Side: User & Auth ── */}
      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <div className={styles.userMenuWrapper} ref={userDropdownRef}>
            <button 
              className={styles.userIconButton} 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              title={username || 'Usuário'}
            >
              <div className={styles.avatarGlow}></div>
              <span className={styles.avatarIcon}>👤</span>
            </button>
            
            {isUserDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${styles.dropdownMenuRight}`}>
                <div className={styles.dropdownHeader}>Logado como <span className={styles.highlight}>{username}</span></div>
                <Link href="/collection" className={styles.dropdownItem} onClick={closeAllMenus}>
                  Minha coleção
                </Link>
                <div className={styles.dropdownDivider}></div>
                <button className={styles.dropdownItemDanger} onClick={handleLogout}>
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
        )}
      </div>
      
    </nav>
  );
};
