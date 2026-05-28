import React from 'react';
import Link from 'next/link';
import { GaleraSidebar } from '@/features/galeras/GaleraSidebar';
import { ContestSidebar } from '@/features/galeras/ContestSidebar';
import styles from './Home.module.css';

export const HomePage: React.FC = () => {
  return (
    <div className={styles.homeLayout}>
      {/* ── Left Sidebar (Members) ── */}
      <GaleraSidebar />

      {/* ── Center Content ── */}
      <main className={styles.mainContent}>
        <div className={styles.heroWrapper}>
          <div className={styles.hero}>
            <h1 className={styles.title}>
              Dominance starts <br />
              with <span className={styles.textGradient}>Strategy.</span>
            </h1>
            <p className={styles.subtitle}>
              O ecossistema definitivo para organizar sua coleção, 
              testar decks e competir com a sua Galera.
            </p>
            <Link href="/decks/create" className={styles.cta}>
              Construir Deck
            </Link>
          </div>
        </div>

        <div className={styles.bannersSection}>
          <Link href="/collections" className={`${styles.bannerCard} ${styles.bannerCollections}`}>
            <div className={styles.bannerIcon}>✦</div>
            <h2 className={styles.bannerTitle}>Coleções</h2>
            <p className={styles.bannerDesc}>Explore pacotes de expansão e construa seu arsenal.</p>
          </Link>

          <Link href="/gatcha" className={`${styles.bannerCard} ${styles.bannerGatcha}`}>
            <div className={styles.bannerIcon}>⟡</div>
            <h2 className={styles.bannerTitle}>Loja (Gatcha)</h2>
            <p className={styles.bannerDesc}>Abra boosters e tente a sorte para cartas raras.</p>
          </Link>

          <div className={`${styles.bannerCard} ${styles.bannerMeta}`}>
            <div className={styles.bannerIcon}>☯</div>
            <h2 className={styles.bannerTitle}>Metagame</h2>
            <p className={styles.bannerDesc}>Acompanhe o formato e a banlist da sua Galera.</p>
          </div>
        </div>
      </main>

      {/* ── Right Sidebar (Tournaments) ── */}
      <ContestSidebar />
    </div>
  );
};
