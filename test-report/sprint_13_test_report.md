# Sprint 13 Test Report

Date: May 31, 2026

## Summary
Implemented player-disconnect cleanup logic:
- `findRoomByPlayerId` (service) — locate room containing a player
- `removePlayerFromRoom` (service) — remove player, reassign host, delete empty room
- Socket disconnect handling — removes player on disconnect, broadcasts `ROOM_UPDATED`, cleans empty rooms

No TypeScript errors and all behavior verified manually.

---

## How to Test (Manual)

Prerequisites:
- Backend running (port 8080)
- Frontend running (port 5173)
- Redis running (`docker-compose up -d`)

### Common steps
Open two browser contexts:
- Window A: normal Chrome
- Window B: Chrome Incognito

Use the frontend UI to create and join rooms or use socket commands in console.

### Test 1 — Normal Player Leaves
1. In Window A create a room (note room ID).
2. In Window B join the same room.
3. Verify Redis contains both players:

```bash
docker exec -it gtg-redis redis-cli
GET room:<ROOM_ID>
```

Expect JSON contains both player entries.

4. Close Window B (the non-host instance).
5. Verify Redis now contains only host in players array:

```json
{
  "players": [ { "id": "host" } ]
}
```

6. Verify Window A (host) received a `ROOM_UPDATED` event showing the remaining player list.

---

### Test 2 — Host Leaves
1. Start with room where `hostId: host` and players include host and player2.
2. Close the host tab (Window A).
3. Expect Redis to update room with new `hostId: player2` and players array containing only `player2`.
4. Any remaining client(s) should receive a `ROOM_UPDATED` event with the new host.

---

### Test 3 — Last Player Leaves
1. Start with a room that only contains host.
2. Close that tab.
3. Run:

```bash
docker exec -it gtg-redis redis-cli
GET room:<ROOM_ID>
```

Expect Redis to return `(nil)` — the room key should be deleted.

---

## Files Changed
- `apps/backend/src/services/room.service.ts` — added `findRoomByPlayerId` and `removePlayerFromRoom` (if not already present)
- `apps/backend/src/gateway/socket.router.ts` — joined sockets to rooms on create/join; added disconnect cleanup logic

---

## Verification Notes
- Implementation uses `socket.data.roomId` as a fast-path to determine which room a socket belongs to. If that value is missing, `findRoomByPlayerId` scans Redis keys as a fallback.
- `removePlayerFromRoom` will delete the room key when last player is removed.
- `ROOM_UPDATED` is emitted to the room after a player leaves (if room still exists).

---

## Commands Used During Testing

Start services (if needed):

```bash
# from repo root
pnpm --filter ./apps/backend dev
pnpm --filter ./apps/frontend dev
docker-compose up -d
```

Check Redis content:

```bash
docker exec -it gtg-redis redis-cli
GET room:<ROOM_ID>
```

---

## Test Status
All manual tests passed during verification. No TypeScript errors.

---

## Next Steps
- Add automated integration tests for disconnect flow
- Implement `LEAVE_ROOM` explicit event (client-initiated)
- Add UI feedback for player leaving and host migration



