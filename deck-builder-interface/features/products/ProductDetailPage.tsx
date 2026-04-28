import React from 'react';
import Link from 'next/link';
import { productService, Product } from './productService';
import styles from './Product.module.css';

interface Props {
  id: string;
}

export const ProductDetailPage: React.FC<Props> = async ({ id }) => {
  const product = await productService.getProductById(id);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <Link href="/" className={styles.backLink}>Go back home</Link>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{product.name}</h1>
      <p className={styles.price}>${product.price}</p>
      <p className={styles.description}>{product.description}</p>
      <Link href="/" className={styles.backLink}>
        ← Back to Home
      </Link>
    </main>
  );
};
