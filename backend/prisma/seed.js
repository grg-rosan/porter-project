import { prisma } from "../src/config/db.config.js";

async function main() {
  await prisma.fareConfig.createMany({
    data: [
      { vehicleType: "BIKE",       baseFare: 50,  perKm: 15, perKg: 3, minFare: 80  },
      { vehicleType: "SCOOTER",    baseFare: 60,  perKm: 18, perKg: 4, minFare: 90  },
      { vehicleType: "VAN",        baseFare: 150, perKm: 40, perKg: 8, minFare: 200 },
      { vehicleType: "MINI_TRUCK", baseFare: 200, perKm: 55, perKg: 10, minFare: 250 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Fare config seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());