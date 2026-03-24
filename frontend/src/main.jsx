import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </SocketProvider>,
);
