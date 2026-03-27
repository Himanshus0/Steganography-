#!/bin/bash
# SteganoVault — Clean startup script
# Run this from the image_steaganography_project folder

PROJECT="$(cd "$(dirname "$0")" && pwd)"

echo "🧹 Clearing ports 3001 and 5173..."
lsof -ti:3001,5173 | xargs kill -9 2>/dev/null || true
sleep 1

echo "🔒 Starting backend (port 3001)..."
cd "$PROJECT/server" && node index.js &
sleep 2

# Verify backend
if curl -s http://localhost:3001/health | grep -q "ok"; then
  echo "   ✅ Backend running at http://localhost:3001"
else
  echo "   ❌ Backend failed to start — check server/index.js"
  exit 1
fi

echo "🎨 Starting frontend (port 5173)..."
cd "$PROJECT/client" && npx vite &
sleep 3

# Verify frontend
if curl -s --max-time 5 http://localhost:5173 | grep -q "SteganoVault"; then
  echo "   ✅ Frontend running at http://localhost:5173"
else
  echo "   ⚠️  Frontend may still be starting — open http://localhost:5173 in 5 seconds"
fi

echo ""
echo "🔏 SteganoVault is ready!"
echo "   Open: http://localhost:5173"
echo ""
echo "   Press Ctrl+C to stop all servers."

# Keep script alive
wait
