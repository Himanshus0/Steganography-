# SteganoVault 🔏

> **Classroom Cybersecurity Mini-Project** — Hide secret messages inside ordinary images using LSB (Least Significant Bit) steganography.

---

## What It Does

- **Sender**: Upload a cover image → type a secret message → download an encoded PNG that looks identical to the original.
- **Receiver**: Upload the encoded PNG → reveal the hidden message with a typewriter animation.

The encoding is imperceptible — only 1 bit per colour channel changes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Vanilla CSS |
| Backend | Node.js 18+, Express, Multer |
| Core Logic | Python 3 + Pillow (LSB steganography) |
| Testing | Vitest (frontend), Jest + Supertest (backend) |

---

## Project Structure

```
image_steaganography_project/
├── encode.py              # Original CLI encode script
├── decode.py              # Original CLI decode script
├── analysis.py            # Original pixel-diff analysis
├── package.json           # Root — runs both dev servers
│
├── server/
│   ├── index.js           # Express app entry
│   ├── routes/
│   │   └── steganography.js   # POST /api/encode, POST /api/decode
│   ├── encode_server.py   # CLI-arg encode script (used by server)
│   ├── decode_server.py   # CLI-arg decode script (used by server)
│   └── tests/
│       └── steganography.test.js
│
└── client/
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx              # Tab nav: Sender / Receiver
    │   ├── index.css            # Full design system
    │   ├── context/
    │   │   └── AppContext.tsx   # Global state (useReducer)
    │   ├── api/
    │   │   └── steganography.ts # fetch wrappers
    │   ├── components/
    │   │   ├── SenderPanel.tsx
    │   │   ├── ReceiverPanel.tsx
    │   │   ├── ImagePreview.tsx
    │   │   ├── StatusBar.tsx
    │   │   └── DecryptionResult.tsx
    │   └── tests/
    │       ├── setup.ts
    │       ├── components.test.tsx
    │       └── api.test.ts
```

---

## Prerequisites

- **Node.js** 18+ with npm
- **Python 3** with Pillow: `pip install Pillow`

---

## Setup & Run

```bash
# 1. Clone / navigate to project
cd image_steaganography_project

# 2. Install all dependencies (root + server + client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Start both servers (runs on :3001 + :5173)
npm run dev

# 4. Open browser
open http://localhost:5173
```

---

## Using the App

### Sender Flow
1. Click the **Sender** tab
2. Upload any PNG/JPG cover image (drag or click)
3. Type your secret message (up to 500 chars)
4. Click **Encode & Download** — a `encoded_secret.png` is saved
5. The side-by-side preview shows original vs. encoded (visually identical!)

### Receiver Flow
1. Click the **Receiver** tab
2. Upload the `encoded_secret.png` file
3. Click **Reveal Hidden Message**
4. Watch the message appear character-by-character 🔓

---

## Running Tests

```bash
# Backend tests (Jest + Supertest)
cd server && npm test

# Frontend tests (Vitest + Testing Library)
cd client && npm test
```

---

## How It Works (LSB Steganography)

Each pixel has 3 colour channels (R, G, B), each 8 bits wide. The **least significant bit** of each channel stores one bit of the message — changing a value from e.g. `200` to `201` is invisible to the human eye.

```
Message character 'H' = 01001000 (ASCII 72)
→ stored across 3 channels of 2-3 pixels (1 bit each)
```

A **16-bit delimiter** (`1111111111111110`) marks the end of the message.

---

## API Reference

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/encode` | `multipart: image (file), message (string)` | `image/png` blob |
| POST | `/api/decode` | `multipart: image (file)` | `{ message: string }` |
| GET | `/health` | — | `{ status: "ok" }` |

---

## Teacher Demo Script

1. **Open** `http://localhost:5173`  
2. **Sender tab** → upload `image.png` from this project folder  
3. Type: `"The secret key is CYBER2024"`  
4. Click **Encode & Download** — show the download + side-by-side preview  
5. **Receiver tab** → upload the downloaded file  
6. Click **Reveal** — show the typewriter animation  
7. **Explain**: "The image looks byte-for-byte the same to the eye, but 1 bit per colour channel is used to encode our message using LSB steganography."

---

## Key Evaluation Metrics

| Criterion | Implementation |
|---|---|
| Encoding correctness | Python `encode.py` + unit test |
| Decoding correctness | Python `decode.py` + backend test |
| Visual imperceptibility | Side-by-side preview in UI |
| Error handling | Status bar, 400/422 HTTP errors |
| Accessibility | ARIA roles, keyboard nav, live regions |
| Responsive | Mobile breakpoints at 600px + 400px |
| Test coverage | Backend (Jest) + Frontend (Vitest) |

---

## Evolving Beyond MVP

- [ ] Add AES/XOR cipher layer before LSB embedding
- [ ] Password-protect the decode step
- [ ] Show pixel-difference heatmap (using `analysis.py`)
- [ ] Support larger message capacity (multi-image chunking)
- [ ] WebSocket for real-time transmission simulation
