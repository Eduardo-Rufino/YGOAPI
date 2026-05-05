import { CollectionManager } from '@/features/collection/CollectionManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha Coleção | YGO Deck Builder',
  description: 'Gerencie sua coleção pessoal de cartas de Yu-Gi-Oh!',
};

export default function CollectionPage() {
  return <CollectionManager />;
}
