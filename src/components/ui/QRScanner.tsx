import { useEffect, useRef } from 'react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted || !containerRef.current) return;

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (mounted) onScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        if (mounted) onError?.(err instanceof Error ? err.message : 'QR scan failed');
      }
    };

    init();

    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black ${className}`}>
      <div id="qr-reader" ref={containerRef} className="[&_video]:rounded-2xl [&_video]:object-cover" />
    </div>
  );
}
