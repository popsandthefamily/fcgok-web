import DocumentEditor from './DocumentEditor';

export const dynamic = 'force-dynamic';

export default async function BuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentEditor documentId={id} />;
}
