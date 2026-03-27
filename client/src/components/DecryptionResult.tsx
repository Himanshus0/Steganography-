import { useEffect, useState } from 'react';

interface Props {
  message: string;
}

export function DecryptionResult({ message }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [copied, setCopied] = useState(false);

  // Typewriter effect — cancelled flag prevents stale intervals from
  // appending after cleanup (avoids the JS `undefined` concatenation bug)
  useEffect(() => {
    setDisplayed('');
    if (!message) return;
    let i = 0;
    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled || i >= message.length) {
        clearInterval(interval);
        return;
      }
      const char = message[i];
      if (char !== undefined) {
        setDisplayed(prev => prev + char);
      }
      i++;
    }, 30);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [message]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="decryption-result" role="region" aria-label="Decrypted message">
      <div className="result-header">
        <span className="result-label">
          <span className="lock-icon">🔓</span> Hidden Message Revealed
        </span>
        <button
          className="copy-btn"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>
      <div className="result-text" aria-live="polite">
        {displayed}
        <span className="cursor-blink" aria-hidden="true">|</span>
      </div>
    </div>
  );
}
