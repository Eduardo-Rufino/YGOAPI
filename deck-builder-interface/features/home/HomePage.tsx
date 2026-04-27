import React from 'react';
import Link from 'next/link';
import styles from './Home.module.css';

export const HomePage: React.FC = () => {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Experience the <br />
          Future of Duel.
        </h1>
        <p className={styles.subtitle}>
          A minimal, feature-based navigation system built for the ultimate Duelist. 
          Manage your decks with precision and style.
        </p>
        <Link href="/decks/create" className={styles.cta}>
          Start Building
        </Link>
      </div>

      <div className={styles.bannersSection}>
        <div className={`${styles.bannerCard} ${styles.bannerCollections}`}>
          <div className={styles.bannerIcon}>✦</div>
          <h2 className={styles.bannerTitle}>Coleções Disponíveis</h2>
          <p className={styles.bannerDesc}>Explore as últimas coleções e expanda sua biblioteca de cartas.</p>
        </div>

        <div className={`${styles.bannerCard} ${styles.bannerBanList}`}>
          <div className={styles.bannerIcon}>⚔</div>
          <h2 className={styles.bannerTitle}>BanList</h2>
          <p className={styles.bannerDesc}>Mantenha-se atualizado com as cartas proibidas e limitadas.</p>
        </div>

        <div className={`${styles.bannerCard} ${styles.bannerMeta}`}>
          <div className={styles.bannerIcon}>☯</div>
          <h2 className={styles.bannerTitle}>Meta</h2>
          <p className={styles.bannerDesc}>Analise as tendências do cenário competitivo e os decks do topo.</p>
        </div>
      </div>
    </main>
  );
};
