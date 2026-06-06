import { BoosterOpening } from '@/features/gatcha/BoosterOpening';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loja | Yu-Gi-Oh! Da Galera',
  description: 'Abra pacotes de cartas e expanda sua coleção pessoal.',
};

export default function GatchaPage() {
  return <BoosterOpening variant="store" />;
}
