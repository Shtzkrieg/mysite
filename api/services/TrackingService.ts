import { PrismaClient } from '@prisma/client';

export class TrackingService {
  constructor(private prisma: PrismaClient) {}

  async logSession(sessionId: string, ip: string) {
    try {
      const result = await this.prisma.session.upsert({
        where: { sessionId },
        update: { timestamp: new Date() },
        create: { sessionId, ip }
      });
      console.log('Session logged:', { sessionId, ip, result });
    } catch (error) {
      console.error('Failed to log session:', { sessionId, error });
      throw error;
    }
  }

  async logClick(sessionId: string, elementId: string) {
    try {
      const result = await this.prisma.click.create({
        data: { sessionId, elementId, timestamp: new Date() }
      });
      console.log('Click logged:', { sessionId, elementId, result });
    } catch (error) {
      console.error('Failed to log click:', { sessionId, elementId, error });
      throw error;
    }
  }
} 