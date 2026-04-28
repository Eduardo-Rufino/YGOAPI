export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

/**
 * Simple service for product-related logic.
 * Separates data fetching/logic from the React components.
 */
export const productService = {
  getProductById: async (id: string): Promise<Product | null> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const products: Record<string, Product> = {
      '1': {
        id: '1',
        name: 'Quantum UI Kit',
        description: 'A premium component library for modern web applications.',
        price: 49,
      },
      '2': {
        id: '2',
        name: 'Nebula Icons',
        description: 'Hand-crafted SVG icons for sleek interfaces.',
        price: 29,
      },
    };

    return products[id] || null;
  },
};
