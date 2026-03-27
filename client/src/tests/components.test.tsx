import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatusBar } from '../components/StatusBar';
import { DecryptionResult } from '../components/DecryptionResult';
import { ImagePreview } from '../components/ImagePreview';

// ── StatusBar ─────────────────────────────────────────────────────────────
describe('StatusBar', () => {
  it('renders idle state', () => {
    render(<StatusBar status="idle" />);
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
  });

  it('renders loading state', () => {
    render(<StatusBar status="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent('Processing');
  });

  it('renders success state', () => {
    render(<StatusBar status="success" />);
    expect(screen.getByRole('status')).toHaveTextContent('Success');
  });

  it('renders error state with message', () => {
    render(<StatusBar status="error" message="File too large" />);
    expect(screen.getByRole('status')).toHaveTextContent('File too large');
  });
});

// ── DecryptionResult ──────────────────────────────────────────────────────
describe('DecryptionResult', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the message with typewriter effect', async () => {
    render(<DecryptionResult message="Hello" />);
    await waitFor(() => expect(screen.getByText(/Hello/)).toBeInTheDocument(), { timeout: 2000 });
  });

  it('copies message to clipboard on button click', async () => {
    render(<DecryptionResult message="Secret msg" />);
    const btn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(btn);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Secret msg'));
  });
});

// ── ImagePreview ──────────────────────────────────────────────────────────
describe('ImagePreview', () => {
  it('renders nothing when no images', () => {
    const { container } = render(<ImagePreview originalSrc={null} encodedSrc={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders original image when provided', () => {
    render(<ImagePreview originalSrc="blob:test" encodedSrc={null} />);
    expect(screen.getByAltText('Original cover')).toBeInTheDocument();
  });

  it('renders both images when both provided', () => {
    render(<ImagePreview originalSrc="blob:orig" encodedSrc="blob:enc" />);
    expect(screen.getByAltText('Original cover')).toBeInTheDocument();
    expect(screen.getByAltText('Encoded image with hidden message')).toBeInTheDocument();
  });
});
