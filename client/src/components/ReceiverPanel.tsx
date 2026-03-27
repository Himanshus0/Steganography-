import { useCallback, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { decodeMessage } from '../api/steganography';
import { StatusBar } from './StatusBar';
import { DecryptionResult } from './DecryptionResult';

export function ReceiverPanel() {
  const { state, dispatch } = useAppContext();
  const { receiver } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      dispatch({
        type: 'RECEIVER_SET_STATUS',
        payload: { status: 'error', errorMessage: 'Please upload a valid image file.' },
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    dispatch({ type: 'RECEIVER_SET_IMAGE', payload: { file, preview } });
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleDecode = async () => {
    if (!receiver.encodedImage) {
      dispatch({
        type: 'RECEIVER_SET_STATUS',
        payload: { status: 'error', errorMessage: 'Please upload an encoded image first.' },
      });
      return;
    }

    dispatch({ type: 'RECEIVER_SET_STATUS', payload: { status: 'loading' } });

    try {
      const message = await decodeMessage(receiver.encodedImage);
      dispatch({ type: 'RECEIVER_SET_DECODED', payload: message });
    } catch (err) {
      dispatch({
        type: 'RECEIVER_SET_STATUS',
        payload: { status: 'error', errorMessage: (err as Error).message },
      });
    }
  };

  return (
    <section className="panel" aria-labelledby="receiver-title">
      <div className="panel-header">
        <div className="panel-icon">🔓</div>
        <div>
          <h2 id="receiver-title" className="panel-title">Receiver</h2>
          <p className="panel-subtitle">Extract the hidden message from an image</p>
        </div>
      </div>

      {/* Step 1: Upload encoded image */}
      <div className="step">
        <div className="step-label"><span className="step-num">1</span>Encoded Image</div>
        <div
          className={`drop-zone ${dragOver ? 'drop-zone--active' : ''} ${receiver.encodedImage ? 'drop-zone--filled' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Upload encoded image. Click or drag and drop."
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {receiver.encodedImagePreview ? (
            <img src={receiver.encodedImagePreview} alt="Uploaded encoded image preview" className="drop-preview" />
          ) : (
            <div className="drop-placeholder">
              <span className="drop-icon">📂</span>
              <span>Drop the encoded PNG here</span>
              <span className="drop-hint">The image must have been encoded by the Sender</span>
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

      {/* Step 2: Decrypt */}
      <div className="step">
        <div className="step-label"><span className="step-num">2</span>Decrypt Message</div>
        <button
          className="btn btn--primary btn--receiver"
          onClick={handleDecode}
          disabled={receiver.status === 'loading' || !receiver.encodedImage}
          aria-busy={receiver.status === 'loading'}
        >
          {receiver.status === 'loading'
            ? <><span className="spin">⟳</span> Decrypting…</>
            : <><span>🔍</span> Reveal Hidden Message</>
          }
        </button>
      </div>

      <StatusBar status={receiver.status} message={receiver.errorMessage} />

      {receiver.decodedMessage && (
        <DecryptionResult message={receiver.decodedMessage} />
      )}
    </section>
  );
}
