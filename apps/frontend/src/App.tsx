import { useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  useEffect(() => {
  const socket = io("http://localhost:8080");

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  return () => {
    socket.disconnect(); // ✅ correct cleanup
  };
}, []);

  return <h1>GTG Game</h1>;
}

export default App;