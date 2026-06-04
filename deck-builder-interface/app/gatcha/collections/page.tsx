import { BoosterOpening } from '@/features/gatcha/BoosterOpening';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coleções | Yu-Gi-Oh! Da Galera',
  description: 'Veja todas as coleções disponíveis e abra boosters da sua galera.',
};

export default function GatchaCollectionsPage() {
  return <BoosterOpening variant="collections" />;
}
