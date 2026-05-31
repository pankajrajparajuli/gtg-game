import { useEffect } from "react";
import { SOCKET_EVENTS } from "@gtg/shared";
import { useSocket } from "./hooks/useSocket.js";

function App() {
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit(SOCKET_EVENTS.CREATE_ROOM);

    const handleRoomCreated = (room: string) => {
      console.log("Room created:", room);
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);
    };
  }, [socketRef]);

  return <h1>GTG Game</h1>;
}

export default App;