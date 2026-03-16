#!/bin/bash
# Start dev server and open in browser

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait a moment for server to start
sleep 3

# Open browser to local dev server
open http://localhost:4322

# Wait for user to stop (Ctrl+C will kill both)
echo "Dev server running on http://localhost:4322"
echo "Press Ctrl+C to stop"
wait $DEV_PID
