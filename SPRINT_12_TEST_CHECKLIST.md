# Sprint 12 Test Checklist

## Pre-Test Setup
- [ ] Backend is running: `pnpm dev` in backend folder
- [ ] Frontend is running: `pnpm dev` in frontend folder
- [ ] Redis is running: `docker-compose up -d`
- [ ] No TypeScript errors in console

## Test Scenario: Two Windows

### Window A (Normal)
- [ ] Open `http://localhost:5173` (or your frontend dev port)
- [ ] Click "Create Room"
- [ ] Console shows: `Room created: { id: "ABC123" }`
- [ ] Room ID is displayed on the page (copy it)

### Window B (Incognito)
- [ ] Open Chrome Incognito
- [ ] Navigate to `http://localhost:5173`
- [ ] Paste the Room ID from Window A into the input field
- [ ] Click "Join Room"
- [ ] Console shows: `Joining room: ABC123`

## Expected Results - Both Windows

### Console Logs
- [ ] Window A console shows:
  ```
  Room created: 
  {
    id: "ABC123"
  }
  ```
- [ ] Both Window A and B console show:
  ```
  Room updated: 
  {
    id: "ABC123",
    players: [
      {
        id: "<socket-id>",
        username: "Host",
        score: 0
      },
      {
        id: "<socket-id>",
        username: "Player-<4-chars>",
        score: 0
      }
    ]
  }
  ```

## Verify Redis

### Step 1: Connect to Redis
```bash
docker exec -it gtg-redis redis-cli
```

### Step 2: Get Room Data
```bash
GET room:ABC123
```

### Step 3: Verify Response
- [ ] Should return JSON with both players:
  ```json
  {
    "id": "ABC123",
    "hostId": "<host-socket-id>",
    "players": [
      {
        "id": "<host-socket-id>",
        "username": "Host",
        "score": 0
      },
      {
        "id": "<player-socket-id>",
        "username": "Player-<4-chars>",
        "score": 0
      }
    ],
    "createdAt": "<timestamp>"
  }
  ```

## Backend Functionality Checklist

### Socket Events
- [ ] `CREATE_ROOM` event handled in socket router
- [ ] `JOIN_ROOM` event handled in socket router
- [ ] `ROOM_CREATED` event emitted to client
- [ ] `ROOM_UPDATED` event broadcast to all clients in room

### Service Layer
- [ ] `createRoom()` service creates room with host as first player
- [ ] `joinRoom()` service adds player to existing room
- [ ] `getRoom()` service retrieves room from Redis
- [ ] Room data includes all players with scores

### Redis Integration
- [ ] Room data persisted in Redis with key: `room:<roomId>`
- [ ] Both players stored in room data
- [ ] Redis data survives across socket connections

### Socket.io
- [ ] Socket joins room channel: `io.to(roomId).emit()`
- [ ] ROOM_UPDATED broadcast reaches all sockets in room
- [ ] Client receives events in correct order

## Frontend Functionality Checklist

### UI Components
- [ ] "Create Room" button present and functional
- [ ] "Join Room" input field present
- [ ] Room ID displayed after creation
- [ ] Instructions visible for testing

### Socket Event Handlers
- [ ] `ROOM_CREATED` event listener active
- [ ] `ROOM_UPDATED` event listener active
- [ ] Console logs are helpful for debugging
- [ ] No console errors

### Type Safety
- [ ] Room type matches backend
- [ ] Player type matches backend
- [ ] No TypeScript errors

## Integration Checklist

- [ ] No TypeScript compilation errors
- [ ] No runtime errors in console
- [ ] Backend properly imports all services
- [ ] Frontend properly imports socket events
- [ ] Shared package exports all types correctly
- [ ] Redis client is properly configured

## Final Verification

- [ ] [ ] Two-window test completes successfully
- [ ] [ ] Room data is consistent across windows
- [ ] [ ] Redis contains correct data
- [ ] [ ] No errors in either console
- [ ] [ ] All events fire in correct order
- [ ] [ ] Ready to commit Sprint 12

## Notes
- Room IDs are 6-character nanoid strings (e.g., "ABC123")
- Each player gets a temporary username: "Host" or "Player-<4-chars>"
- Timestamps are ISO strings
- All data is stored in Redis for persistence

## Next Steps After Sprint 12
1. Implement LEAVE_ROOM event
2. Implement START_GAME event
3. Add game state management
4. Implement timer and drawing events
