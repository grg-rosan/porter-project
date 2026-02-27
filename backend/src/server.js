import express from "express";
import cors from "cors"
import {config} from "dotenv";
import {connectDB, disconnectDB} from  "./config/db.config.js"

//Import user Routes
import authRoutes from "./routes/authRoutes.js"
import customerRoutes from "./routes/customerRoute.js"
import  riderRoute from "./routes/riderRoute.js"
// import { getOrderController } from "./controllers/getOrderController.js";


config();
connectDB();


const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API routes
app.use("/api/auth",authRoutes)
app.use("/api/customer",customerRoutes)
  
app.use("/api/rider",riderRoute)



app.listen(port,()=>{
    console.log(`listening to port ${port}`)
})

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});