'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function CodeEditor({ value, onChange, language = 'python', height = '300px' }) {
  const [mounted, setMounted] = useState(false);
  
  // We need to dynamically import the Monaco editor because it uses browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Simple textarea fallback for server-side rendering
  if (!mounted) {
    return (
      <Card className="overflow-hidden border border-input">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
          style={{ height }}
          placeholder="Loading editor..."
        />
      </Card>
    );
  }
  
  // Client-side only component for Monaco editor
  const MonacoEditor = () => {
    // Dynamically import the Monaco editor
    const { default: Editor } = require('@monaco-editor/react');
    
    return (
      <Card className="overflow-hidden border border-input">
        <Editor
          value={value}
          onChange={onChange}
          language={language}
          height={height}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: "monospace",
            fontSize: 14,
            tabSize: 4,
            automaticLayout: true,
            wordWrap: "on",
            lineNumbers: "on",
          }}
        />
      </Card>
    );
  };
  
  return <MonacoEditor />;
}