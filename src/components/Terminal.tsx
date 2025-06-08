'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import '@fontsource/vt323';

interface TerminalProps {
  onInput: (input: string) => void;
  output: string;
}

export default function Terminal({ onInput, output }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      fontFamily: 'VT323, monospace',
      fontSize: 18,
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
      },
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    term.onData((data) => {
      if (data === '\r') {
        const input = term.buffer.active.getLine(term.buffer.active.baseY)?.translateToString() || '';
        onInput(input);
        term.write('\r\n');
      } else {
        term.write(data);
      }
    });

    return () => {
      term.dispose();
    };
  }, [onInput]);

  useEffect(() => {
    if (xtermRef.current && output) {
      xtermRef.current.write(output + '\r\n');
    }
  }, [output]);

  return (
    <div className="w-full h-[500px] bg-black rounded-lg p-4 shadow-lg border-2 border-green-500">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
} 