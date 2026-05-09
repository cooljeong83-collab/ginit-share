import ShareMeetingClient from './ShareMeetingClient';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = typeof token === 'string' ? token : '';
  return <ShareMeetingClient token={decodeURIComponent(raw)} />;
}
