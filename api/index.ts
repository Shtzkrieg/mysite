import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'

// Load environment variables
dotenv.config({ path: '.env.development.local' })

const app = express()
app.use(cors())
const prisma = new PrismaClient()

app.get('/api/education', async (_req: Request, res: Response) => {
  try {
    const educationItems = await prisma.educationItem.findMany({
      include: {
        courses: true
      }
    });
    
    const formattedItems = educationItems.map(educationItem => ({
      institution: educationItem.institution,
      area: educationItem.area,
      studyType: educationItem.studyType,
      startDate: educationItem.startDate,
      endDate: educationItem.endDate ?? undefined,
      gpa: educationItem.gpa ?? undefined,
      courses: educationItem.courses.map(course => course.name)
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Failed to fetch education items:', error);
    res.status(500).json({ error: 'Failed to fetch education data' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}); 