import dynamic from 'next/dynamic';
import Head from 'next/head';
const ChatAssistant = dynamic(() => import('../components/ChatAssistant'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Mobile Comparison Assistant</title>
        <meta name="description" content="Compare phones and get recommendations" />
      </Head>
      <ChatAssistant />
    </>
  );
}
