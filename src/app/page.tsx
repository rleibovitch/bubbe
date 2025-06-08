'use client';

import { useState } from 'react';
import Terminal from '@/components/Terminal';
import OpenAI from 'openai';

export default function Home() {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = async (input: string) => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const thread = await openai.beta.threads.create();
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: input,
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: 'asst_XIiZsNjNlWfaGcErjzYMb71W',
      });

      let runStatus = await openai.beta.threads.runs.retrieve({ thread_id: thread.id, run_id: run.id } as any);
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve({ thread_id: thread.id, run_id: run.id } as any);
      }

      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data[0];
      if (assistantMessage.content[0].type === 'text') {
        setOutput(assistantMessage.content[0].text.value);
      }
    } catch (error) {
      setOutput('Error: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-pixel text-green-500 mb-8 text-center">
          BUBBE.AI
        </h1>
        <div className="relative">
          <Terminal onInput={handleInput} output={output} />
          {isLoading && (
            <div className="absolute top-4 right-4 text-green-500 animate-pulse">
              Processing...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
