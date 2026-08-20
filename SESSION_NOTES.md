# Session Notes — August 19, 2026

## What was fixed in this session

### Bug 1: Real-time messaging not working
Root cause: WebSocket libraries (sockjs-client, stompjs) failed to 
load in the browser with "ReferenceError: global is not defined"

Fixes applied:
- artifacts/mockup-sandbox/vite.config.ts — added define: { global: "globalThis" } 
- artifacts/mockup-sandbox/src/hooks/useWebSocket.ts — added runtime polyfill before dynamic import
- artifacts/mockup-sandbox/src/hooks/useWebSocket.ts — added client.heartbeat.outgoing/incoming = 20000 (Railway connection drops without heartbeat)
- artifacts/mockup-sandbox/src/hooks/useWebSocket.ts — changed reconnect base delay from 1000ms to 3000ms
- artifacts/mockup-sandbox/src/contexts/websocket-context.tsx — added isConnected to subscription effect dependency array so subscription retries on connect
- artifacts/mockup-sandbox/src/pages/messages/conversation.tsx — added dedup check on send to prevent duplicate messages

Status: FIXED and tested — both directions working in real time

### Bug 2: Category pages showing empty listings
Root cause: category-page.tsx was reading data.content but the 
backend PageResponse returns data.results. Every other page in 
the app reads data.results correctly — only this page had the 
wrong field name.

Fix applied:
- artifacts/mockup-sandbox/src/pages/categories/category-page.tsx 
  line 90: changed data.content to data.results

Status: FIXED and tested — listings now appear correctly in categories

### Bug 3: View All on dashboard showing empty search bar
Root cause: The View All button linked to /search with no query 
parameter. The search page requires ?q= to show results so it 
showed an empty state.

Fix applied:
- artifacts/mockup-sandbox/src/pages/dashboard.tsx line 287: 
  changed Link destination from /search to /categories

Status: FIXED — View All now goes to the categories browse page

## Outstanding issues (known, not fixed yet)

1. POST /api/v1/categories has no authentication — anyone can 
   create/edit/delete categories without logging in
2. GET /api/v1/admin/reports returns raw User entity including 
   password hash field
3. Notification endpoints return 500 instead of 404 when 
   notification is not found (NotificationController.java lines 49, 68, 80, 92)
4. POST /api/v1/listings anonymous request returns 500 NPE instead of 401
5. Token blacklist is in-memory only — lost on server restart

## Current deployment
- Backend: Railway — https://backend-production-53d7.up.railway.app
- Frontend: hosted separately (Alvin managing)
- All fixes committed and pushed to master branch

## To test on hosted platform
1. Real-time messaging — open two browser tabs, log in as different 
   users, confirm messages appear without refreshing
2. Categories — click any category with listings, confirm listings appear
3. View All — confirm it goes to categories page not a search bar
