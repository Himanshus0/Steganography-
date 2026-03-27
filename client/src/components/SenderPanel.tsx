import { useCallback, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { encodeMessage } from '../api/steganography';
import { StatusBar } from './StatusBar';
import { ImagePreview } from './ImagePreview';

const MAX_CHARS = 500;

export function SenderPanel() {
  const { state, dispatch } = useAppContext();
  const { sender } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      dispatch({ type: 'SENDER_SET_STATUS', payload: { status: 'error', errorMessage: 'Please upload a valid image file.' } });
      return;
    }
    const preview = URL.createObjectURL(file);
    dispatch({ type: 'SENDER_SET_IMAGE', payload: { file, preview } });
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleEncode = async () => {
    if (!sender.coverImage) {
      dispatch({ type: 'SENDER_SET_STATUS', payload: { status: 'error', errorMessage: 'Please upload a cover image first.' } });
      return;
    }
    if (!sender.message.trim()) {
      dispatch({ type: 'SENDER_SET_STATUS', payload: { status: 'error', errorMessage: 'Please enter a message to hide.' } });
      return;
    }

    dispatch({ type: 'SENDER_SET_STATUS', payload: { status: 'loading' } });

    try {
      const blob = await encodeMessage(sender.coverImage, sender.message);
      const url = URL.createObjectURL(blob);
      dispatch({ type: 'SENDER_SET_ENCODED', payload: url });

      // Auto-trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encoded_secret.png';
      a.click();
    } catch (err) {
      dispatch({
        type: 'SENDER_SET_STATUS',
        payload: { status: 'error', errorMessage: (err as Error).message },
      });
    }
  };

  const charsLeft = MAX_CHARS - sender.message.length;

  return (
    <section className="panel" aria-labelledby="sender-title">
      <div className="panel-header">
        <div className="panel-icon">🔒</div>
        <div>
          <h2 id="sender-title" className="panel-title">Sender</h2>
          <p className="panel-subtitle">Hide your message inside an image</p>
        </div>
      </div>

      {/* Step 1: Upload cover image */}
      <div className="step">
        <div className="step-label"><span className="step-num">1</span>Cover Image</div>
        <div
          className={`drop-zone ${dragOver ? 'drop-zone--active' : ''} ${sender.coverImage ? 'drop-zone--filled' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Upload cover image. Click or drag and drop."
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {sender.coverImagePreview ? (
            <img src={sender.coverImagePreview} alt="Cover image preview" className="drop-preview" />
          ) : (
            <div className="drop-placeholder">
              <span className="drop-icon">🖼️</span>
              <span>Click or drag an image here</span>
              <span className="drop-hint">PNG, JPG, BMP up to 20 MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            aria-hidden="true"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
          />
        </div>
      </div>

      {/* Step 2: Secret message */}
      <div className="step">
        <div className="step-label">
          <span className="step-num">2</span>Secret Message
          <span className={`char-count ${charsLeft < 50 ? 'char-count--warn' : ''}`}>{charsLeft} left</span>
        </div>
        <textarea
          className="message-input"
          value={sender.message}
          maxLength={MAX_CHARS}
          placeholder="Type your secret message here…"
          aria-label="Secret message to hide"
          spellCheck
          onChange={e => dispatch({ type: 'SENDER_SET_MESSAGE', payload: e.target.value })}
        />
      </div>

      {/* Step 3: Encode */}
      <div className="step">
        <div className="step-label"><span className="step-num">3</span>Encode &amp; Download</div>
        <button
          className="btn btn--primary"
          onClick={handleEncode}
          disabled={sender.status === 'loading'}
          aria-busy={sender.status === 'loading'}
        >
          {sender.status === 'loading'
            ? <><span className="spin">⟳</span> Encoding…</>
            : <><span>🔐</span> Encode &amp; Download</>
          }
        </button>
      </div>

      <StatusBar status={sender.status} message={sender.errorMessage} />

      {/* Preview comparison */}
      <ImagePreview
        originalSrc={sender.coverImagePreview}
        encodedSrc={sender.encodedImageUrl}
      />

      {sender.encodedImageUrl && (
        <a
          className="btn btn--outline"
          href={sender.encodedImageUrl}
          download="encoded_secret.png"
          aria-label="Download encoded image again"
        >
          ⬇ Download Again
        </a>
      )}
    </section>
  );
}
