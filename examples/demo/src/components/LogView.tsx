import { useEffect, useRef } from 'react';

export default function LogView({ logs }: { logs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={ref}
      style={{
        maxHeight: 150,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 12,
        background: 'var(--ion-color-light)',
        padding: 8,
        margin: 8,
        borderRadius: 8,
      }}
    >
      {logs.length === 0 && <p style={{ margin: 0, color: '#999' }}>Logs will appear here...</p>}
      {logs.map((entry, i) => (
        <p key={i} style={{ margin: '2px 0' }}>
          {entry}
        </p>
      ))}
    </div>
  );
}
