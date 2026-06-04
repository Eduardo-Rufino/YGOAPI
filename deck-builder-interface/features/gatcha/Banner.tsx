'use client';

import React from 'react';
import styles from './Banner.module.css';
import { CollectionInfo } from '@/features/decks/deckService';

interface BannerProps {
  collection: CollectionInfo | null;
  onSelectCollection: (collection: CollectionInfo) => void;
}

export const Banner: React.FC<BannerProps> = ({ collection, onSelectCollection }) => {
  if (!collection) {
    return null;
  }

  return (
    <section className={styles.bannerCard}>
      <div className={styles.bannerGlow} />
      <div className={styles.bannerContent}>
        <div>
          <p className={styles.eyebrow}>Última coleção adicionada</p>
          <h2 className={styles.title}>{collection.name}</h2>
          <p className={styles.description}>
            Explore esta coleção recém-chegada, veja suas cartas disponíveis e vá direto para o booster que você quer abrir.
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>Restam {collection.remainingStock} cartas</span>
            <span className={styles.badge}>Preço: {collection.price} ponto{collection.price === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <img src={collection.coverImageUrl || '/CardBack.jpg'} alt={collection.name} className={styles.cover} />
          <button className={styles.ctaButton} onClick={() => onSelectCollection(collection)}>
            Ir para esta coleção
          </button>
        </div>
      </div>
    </section>
  );
};
