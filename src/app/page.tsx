'use client';

import dynamic from 'next/dynamic';

const OpenAITerminal = dynamic(() => import('@/components/OpenAITerminal'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-pixel text-green-500 mb-8 text-center">
          BUBBE.AI
        </h1>
        <OpenAITerminal />
      </div>
    </main>
  );
}
