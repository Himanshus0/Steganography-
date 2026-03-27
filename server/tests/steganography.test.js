const request = require('supertest');
const app = require('../index');
const path = require('path');
const fs = require('fs');

// Use the existing image.png from the project root for testing
const TEST_IMAGE = path.join(__dirname, '../../image.png');
const TEST_ENCODED = path.join(__dirname, '../../encoded.png');

describe('POST /api/encode', () => {
  it('returns 400 when no image is provided', async () => {
    const res = await request(app).post('/api/encode').field('message', 'hello');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when message is empty', async () => {
    if (!fs.existsSync(TEST_IMAGE)) return; // skip if no test image
    const res = await request(app)
      .post('/api/encode')
      .attach('image', TEST_IMAGE)
      .field('message', '');
    expect(res.status).toBe(400);
  });

  it('encodes message and returns a PNG', async () => {
    if (!fs.existsSync(TEST_IMAGE)) return;
    const res = await request(app)
      .post('/api/encode')
      .attach('image', TEST_IMAGE)
      .field('message', 'test_secret_123');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
    expect(res.body).toBeInstanceOf(Buffer);
  }, 20000);
});

describe('POST /api/decode', () => {
  it('returns 400 when no image is provided', async () => {
    const res = await request(app).post('/api/decode');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('decodes message from encoded image', async () => {
    if (!fs.existsSync(TEST_ENCODED)) return;
    const res = await request(app)
      .post('/api/decode')
      .attach('image', TEST_ENCODED);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  }, 20000);
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
