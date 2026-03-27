import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encodeMessage, decodeMessage } from '../api/steganography';

const mockBlob = new Blob(['fake-png-data'], { type: 'image/png' });
const mockFile = new File(['fake-img'], 'test.png', { type: 'image/png' });

describe('steganography API client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  describe('encodeMessage', () => {
    it('calls POST /api/encode and returns a blob on success', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });
      const result = await encodeMessage(mockFile, 'hello');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/encode'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toBe(mockBlob);
    });

    it('throws on non-ok response', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Message empty' }),
      });
      await expect(encodeMessage(mockFile, '')).rejects.toThrow('Message empty');
    });
  });

  describe('decodeMessage', () => {
    it('calls POST /api/decode and returns the message string', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'hidden secret' }),
      });
      const result = await decodeMessage(mockFile);
      expect(result).toBe('hidden secret');
    });

    it('throws on decode error', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ error: 'No message found' }),
      });
      await expect(decodeMessage(mockFile)).rejects.toThrow('No message found');
    });
  });
});
