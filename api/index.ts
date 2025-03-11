import { PrismaClient } from '@prisma/client'
import express, { json } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'
import { DataService } from './services/DataService'
import { TrackingService } from './services/TrackingService'

// Load environment variables
dotenv.config({ path: '.env.development.local' })

const app = express()
app.use(cors())
app.use(json())

// Initialize services
const prisma = new PrismaClient()
const dataService = new DataService(prisma)
const trackingService = new TrackingService(prisma)

// ------------------------------------------------------------------------------------------------
// Data Endpoints
// ------------------------------------------------------------------------------------------------

app.get('/api/education', async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await dataService.getEducation();
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch education items:', error);
    res.status(500).json({ error: 'Failed to fetch education data' });
  }
});

// ------------------------------------------------------------------------------------------------ 
// Session Tracking
// ------------------------------------------------------------------------------------------------

interface SessionBody {
  sessionId: string;
}

interface ClickBody {
  sessionId: string;
  elementId: string;
}

app.post<{}, {}, SessionBody>('/api/log-session', async (req, res): Promise<void> => {
  const { sessionId } = req.body;
  const ip = req.ip;
  const xForwardedFor = req.headers['x-forwarded-for'];

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  try {
    await trackingService.logSession(
      sessionId,
      Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor || ip || 'unknown'
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ error: 'Failed to log session' });
  }

  console.log('Session logged:', sessionId, ip);
});

app.post<{}, {}, ClickBody>('/api/log-click', async (req, res): Promise<void> => {
  const { sessionId, elementId } = req.body;

  if (!sessionId || !elementId) {
    res.status(400).json({ error: 'sessionId and elementId are required' });
    return;
  }

  try {
    await trackingService.logClick(sessionId, elementId);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging click:', error);
    res.status(500).json({ error: 'Failed to log click' });
  }

  console.log('Click logged:', sessionId, elementId);
});

// ------------------------------------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------------------------------------

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}); 