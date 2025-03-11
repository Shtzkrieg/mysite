import { PrismaClient } from '@prisma/client';

export class DataService {
  constructor(private prisma: PrismaClient) {}

  async getEducation() {
    try {
      const items = await this.prisma.educationItem.findMany({
        include: { courses: true }
      });
      
      console.log('Education query result:', {
        itemCount: items.length,
        items: items
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
      console.error('Failed to fetch education items:', error);
      throw error;
    }
  }
} 