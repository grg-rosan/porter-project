import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.fareConfig.createMany({
  data: [
    { vehicleType: "SCOOTER", baseFare: 30, perKm: 15, perKg: 2, minFare: 80 },
    { vehicleType: "BIKE", baseFare: 40, perKm: 18, perKg: 2.5, minFare: 100 },
    {
      vehicleType: "MINI_TRUCK",
      baseFare: 80,
      perKm: 25,
      perKg: 3,
      minFare: 150,
    },
    { vehicleType: "VAN", baseFare: 200, perKm: 35, perKg: 5, minFare: 500 },
  ],
});

await prisma.$disconnect();