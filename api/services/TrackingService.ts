import { PrismaClient } from '@prisma/client';

export class TrackingService {
  constructor(private prisma: PrismaClient) {}

  async logSession(sessionId: string, ip: string) {
    await this.prisma.session.upsert({
      where: { sessionId },
      update: { timestamp: new Date() },
      create: { sessionId, ip }
    });
  }

  async logClick(sessionId: string, elementId: string) {
    await this.prisma.click.create({
      data: { sessionId, elementId, timestamp: new Date() }
    });
  }
} 