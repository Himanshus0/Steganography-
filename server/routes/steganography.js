const express = require('express');
const router = express.Router();
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

// ── Multer: store uploads in OS temp dir ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `stegano-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('Only image files are allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

const PYTHON = process.env.PYTHON_BIN || 'python3';
const SCRIPTS_DIR = path.join(__dirname, '..');

// ── Helper: run a Python script and return stdout ───────────────────────────
function runPython(scriptPath, args) {
  return new Promise((resolve, reject) => {
    execFile(PYTHON, [scriptPath, ...args], { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr.trim() || err.message;
        return reject(Object.assign(new Error(msg), { status: 422 }));
      }
      resolve(stdout);
    });
  });
}

// ── POST /api/encode ─────────────────────────────────────────────────────────
router.post('/encode', upload.single('image'), async (req, res, next) => {
  const inputPath = req.file?.path;
  const message = (req.body.message || '').trim();

  if (!inputPath) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  if (!message) {
    fs.unlink(inputPath, () => {});
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const outputPath = path.join(os.tmpdir(), `encoded-${uuidv4()}.png`);

  try {
    const scriptPath = path.join(__dirname, '..', 'encode_server.py');
    await runPython(scriptPath, [inputPath, message, outputPath]);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="encoded.png"');

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
    stream.on('end', () => {
      fs.unlink(inputPath, () => {});
      fs.unlink(outputPath, () => {});
    });
    stream.on('error', next);
  } catch (err) {
    fs.unlink(inputPath, () => {});
    fs.unlink(outputPath, () => {});
    next(err);
  }
});

// ── POST /api/decode ─────────────────────────────────────────────────────────
router.post('/decode', upload.single('image'), async (req, res, next) => {
  const inputPath = req.file?.path;

  if (!inputPath) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    const scriptPath = path.join(__dirname, '..', 'decode_server.py');
    const message = await runPython(scriptPath, [inputPath]);

    fs.unlink(inputPath, () => {});
    res.json({ message: message.trim() });
  } catch (err) {
    fs.unlink(inputPath, () => {});
    next(err);
  }
});

module.exports = router;
