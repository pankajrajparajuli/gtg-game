import { useSocket } from "./hooks/useSocket.js";

function App() {
  // This initializes the socket, registers the log listener, 
  // and handles cleanup when the app unmounts.
  useSocket();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <h1 className="text-4xl font-bold">GTG Game</h1>
    </div>
  );
}

export default App;