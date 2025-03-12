import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Log environment information
console.log(
  `🔍 [Prisma] Initializing in environment: ${process.env.NODE_ENV || "development"}`
);
console.log(
  `🔍 [Prisma] Runtime environment: ${process.env.VERCEL_REGION || "local"}`
);
console.log(
  `🔍 [Prisma] Edge runtime: ${typeof process.env.EDGE_RUNTIME !== "undefined" ? "Yes" : "No"}`
);
console.log(
  `🔍 [Prisma] Database URL configured: ${process.env.DATABASE_URL ? "Yes" : "No"}`
);
console.log(
  `🔍 [Prisma] Accelerate URL configured: ${process.env.PRISMA_ACCELERATE_URL ? "Yes" : "No"}`
);

// Create a new instance of PrismaClient
const prismaClientSingleton = () => {
  console.log(
    `🔍 [Prisma] Creating new PrismaClient instance with Accelerate extension`
  );
  try {
    // Create client with debug logging in development
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    }).$extends(withAccelerate());

    console.log(`✅ [Prisma] PrismaClient instance created successfully`);
    return client;
  } catch (error) {
    console.error(`❌ [Prisma] Error creating PrismaClient:`, error);
    throw error;
  }
};

// Define the global type for PrismaClient
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create or reuse the global Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
