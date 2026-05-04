import { DeckCreate } from "@/features/decks/DeckCreate";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DeckCreate initialDeckId={id} />;
}
