import dotenv from "dotenv"
dotenv.config({ override: false })
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient }  = pkg

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }],
  adapter,
});
prisma.$on("query", (e) => {
  console.log("Query:", e.query);
  console.log("Params:", e.params);
  console.log("Duration:", e.duration + "ms");
});
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("db connected via prisma");
     console.log("NODE_ENV:", process.env.NODE_ENV);
  } catch (error) {
    console.log(`db connection error:${error.message}`);
  }
};
const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
