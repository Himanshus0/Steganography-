const API_BASE = 'http://localhost:3001/api';

/**
 * Encode a message into a cover image via the backend.
 * Returns a Blob (PNG) containing the encoded image.
 */
export async function encodeMessage(image: File, message: string): Promise<Blob> {
  const form = new FormData();
  form.append('image', image);
  form.append('message', message);

  const res = await fetch(`${API_BASE}/encode`, { method: 'POST', body: form });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Encode failed (${res.status})`);
  }

  return res.blob();
}

/**
 * Decode a hidden message from an encoded image via the backend.
 * Returns the hidden message string.
 */
export async function decodeMessage(image: File): Promise<string> {
  const form = new FormData();
  form.append('image', image);

  const res = await fetch(`${API_BASE}/decode`, { method: 'POST', body: form });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error ?? `Decode failed (${res.status})`);
  }

  return body.message as string;
}
