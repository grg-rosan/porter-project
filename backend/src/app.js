import express from "express";
import cors from "cors"
import {config} from "dotenv";
import {connectDB, disconnectDB} from  "./config/db.config.js"

//Import user Routes
import authRoutes from "./modules/auth/auth.route.js"
import customerRouter from "./modules/customer/customer.route.js";
// import  riderRoute from "./modules/rider/riderRoute.js"
import cookieParser from "cookie-parser";

config();
connectDB();


const app = express();

app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//API routes
app.use("/api/auth",authRoutes)
app.use("/api/customer",customerRouter)
// app.use("/api/rider",riderRoute)


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


export default app;