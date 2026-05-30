import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:8080");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}