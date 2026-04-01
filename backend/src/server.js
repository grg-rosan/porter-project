import http from "http"
import { Server as socketIOServer} from "socket.io"
import app from "./app.js";
import { disconnectDB } from "./config/db.config.js";
import { startOrderConsumer } from "./modules/order/order.consumer.js";
import { initSocketHandlers } from "./infrastructure/socket/socket.handler.js";

const port = 3000;

//create raw http server from express
const server = http.createServer(app);

//initilize socket io
const io = new socketIOServer(server, {
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
})

initSocketHandlers(io)
startOrderConsumer(io)
server.listen(port,()=>{
    console.log(`listening to port ${port}`)
})

// ✅ Graceful shutdown helper
const shutdown = async (code, reason) => {
  console.log(`Shutting down — ${reason}`);
  server.close(async () => {
    io.close();           // close socket.io connections
    await disconnectDB();
    process.exit(code);
  });

  // Force kill if graceful close hangs after 10s
  setTimeout(() => process.exit(code), 10_000).unref();
};

// ✅ Shutdown handlers — all using the same helper
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown(1, "unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown(1, "uncaughtException");
});

process.on("SIGTERM", () => shutdown(0, "SIGTERM"));
process.on("SIGINT",  () => shutdown(0, "SIGINT"));   // ✅ handles Ctrl+C in dev


export {server, io}