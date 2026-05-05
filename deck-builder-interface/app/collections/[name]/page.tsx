import { CollectionDetail } from '@/features/collections/CollectionDetail';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);
  return {
    title: `${name} | Coleções`,
    description: `Explorando a coleção ${name} no Yu-Gi-Oh! Deck Builder.`,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const resolvedParams = await params;
  return <CollectionDetail name={resolvedParams.name} />;
}
