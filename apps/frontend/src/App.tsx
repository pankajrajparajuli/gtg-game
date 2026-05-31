import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@gtg/shared";
import { useSocket } from "./hooks/useSocket.js";

function App() {
  const socketRef = useSocket();
  const [roomId, setRoomId] = useState<string>("");
  const [joinInput, setJoinInput] = useState<string>("");

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Listen for room creation
    const handleRoomCreated = (room: { id: string }) => {
      console.log("Room created:", room);
      setRoomId(room.id);
    };

    // Listen for room updates
    const handleRoomUpdated = (room: { id: string; players: Array<{ id: string; score: number }> }) => {
      console.log("Room updated:", room);
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    };
  }, [socketRef]);

  const handleCreateRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.CREATE_ROOM);
  };

  const handleJoinRoom = () => {
    const socket = socketRef.current;
    if (!socket || !joinInput.trim()) return;
    console.log(`Joining room: ${joinInput}`);
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, joinInput.trim());
    setJoinInput("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>GTG Game - Sprint 12 Test</h1>
      
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Window A - Create Room</h2>
        <button onClick={handleCreateRoom} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Create Room
        </button>
        {roomId && (
          <p style={{ color: "green", fontWeight: "bold" }}>
            Room Created! ID: <code>{roomId}</code>
            <br />
            <small>Use this ID to join from Window B (Incognito)</small>
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Window B - Join Room</h2>
        <input
          type="text"
          placeholder="Enter room ID"
          value={joinInput}
          onChange={(e) => setJoinInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
          style={{ padding: "8px", marginRight: "10px", width: "150px" }}
        />
        <button onClick={handleJoinRoom} style={{ padding: "8px 20px", fontSize: "14px" }}>
          Join Room
        </button>
      </div>

      <div style={{ padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Open this app normally (Window A)</li>
          <li>Click "Create Room" and copy the Room ID</li>
          <li>Open Chrome Incognito (Window B)</li>
          <li>Paste the Room ID and click "Join Room"</li>
          <li>Check console in both windows for Room created and Room updated logs</li>
          <li>Verify Redis: <code>docker exec -it gtg-redis redis-cli</code> then <code>GET room:{'<'}ID{'>'}</code></li>
        </ol>
      </div>

      <p style={{ marginTop: "20px", color: "#666" }}>
        Open browser DevTools (F12) → Console tab to see socket events
      </p>
    </div>
  );
}

export default App;