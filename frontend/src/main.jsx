import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "leaflet/dist/leaflet.css";
import { UserProvider } from "./context/userContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <UserProvider>
        <App />
    </UserProvider>
  </AuthProvider>
);
