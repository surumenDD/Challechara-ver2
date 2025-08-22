import EditorPage from './EditorPage';

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({ id: `book-${i + 1}` }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <EditorPage bookId={params.id} />;
}
