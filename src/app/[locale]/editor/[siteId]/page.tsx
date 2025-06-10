import EditorClient from '@/components/business/editor/editor';

export default function EditorPage({ params }: { params: { siteId: string } }) {
    return <EditorClient siteId={params.siteId} />;
} 