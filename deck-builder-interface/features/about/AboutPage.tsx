import React from 'react';
import styles from './About.module.css';

export const AboutPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>About This Project</h1>
      <div className={styles.content}>
        <p>
          This application demonstrates a <span className={styles.highlight}>feature-based architecture</span> for small-scale projects. 
          By organizing code by domain rather than by technical type (components, hooks, etc.), 
          we achieve better maintainability and clarity as the project grows.
        </p>
        <p>
          The navigation system is built with Next.js App Router, using custom hooks to separate logic from UI. 
          The design follows modern standards with glassmorphism, responsive typography, and subtle micro-interactions.
        </p>
        <p>
          Built by <span className={styles.highlight}>Antigravity</span> for the Google Deepmind team.
        </p>
      </div>
    </main>
  );
};
