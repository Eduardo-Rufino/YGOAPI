import { CollectionsList } from '@/features/collections/CollectionsList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coleções Disponíveis | YGO Deck Builder',
  description: 'Explore todas as coleções de cartas de Yu-Gi-Oh! disponíveis no sistema.',
};

export default function CollectionsPage() {
  return <CollectionsList />;
}
