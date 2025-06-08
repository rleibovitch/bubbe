'use client';

import { useState } from 'react';
import Terminal from './Terminal';

export default function OpenAITerminal() {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = async (input: string) => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      // Dynamically import OpenAI only on the client
      const OpenAI = (await import('openai')).default;
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

      // @ts-expect-error - OpenAI API types are not fully compatible with the actual API
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // @ts-expect-error - OpenAI API types are not fully compatible with the actual API
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data[0];
      if (assistantMessage?.content[0]?.type === 'text') {
        setOutput(assistantMessage.content[0].text.value);
      } else {
        setOutput('No response received from the assistant.');
      }
    } catch (error) {
      console.error('Error:', error);
      setOutput('Error: ' + (error instanceof Error ? error.message : 'An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Terminal onInput={handleInput} output={output} />
      {isLoading && (
        <div className="absolute top-4 right-4 text-green-500 animate-pulse">
          Processing...
        </div>
      )}
    </div>
  );
} 