import { PrismaClient } from '@prisma/client';

export class DataService {
  constructor(private prisma: PrismaClient) {}

  async getEducation() {
    try {
      const items = await this.prisma.educationItem.findMany({
        include: { courses: true }
      });
      
      return items.map(item => ({
        institution: item.institution,
        area: item.area,
        studyType: item.studyType,
        startDate: item.startDate,
        endDate: item.endDate ?? undefined,
        gpa: item.gpa ?? undefined,
        courses: item.courses.map(course => course.name)
      }));
    } catch (error) {
      console.error('Database error in getEducation:', {
        error,
        connectionInfo: {
          url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Hide password
          nodeEnv: process.env.NODE_ENV
        }
      });
      throw error;
    }
  }
} 