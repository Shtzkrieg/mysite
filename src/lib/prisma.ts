/* eslint-disable no-var */
import { PrismaClient } from '@prisma/client'

// Create a singleton instance of PrismaClient
let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Server-side - use global
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: {
        db: {
          url: import.meta.env.VITE_DATABASE_URL
        }
      }
    });
  }
  prisma = (global as any).prisma;
} else {
  // Client-side - create new instance
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: import.meta.env.VITE_DATABASE_URL
      }
    }
  });
}

export default prisma; 