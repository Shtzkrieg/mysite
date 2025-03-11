import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataService } from '../DataService'
import { TrackingService } from '../TrackingService'

// Create minimal mock with just the methods we need
const mockPrisma = {
  educationItem: {
    findMany: vi.fn()
  },
  session: {
    upsert: vi.fn()
  },
  click: {
    create: vi.fn()
  }
}

describe('Services', () => {
  let dataService: DataService
  let trackingService: TrackingService

  beforeEach(() => {
    vi.clearAllMocks()
    dataService = new DataService(mockPrisma as any)
    trackingService = new TrackingService(mockPrisma as any)
  })

  describe('DataService', () => {
    it('formats education data correctly', async () => {
      const mockData = [{
        institution: 'Test University',
        area: 'Computer Science',
        studyType: 'Bachelor',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01'),
        gpa: 3.8,
        courses: [{ name: 'Data Structures' }]
      }]

      mockPrisma.educationItem.findMany.mockResolvedValue(mockData)

      const result = await dataService.getEducation()
      expect(result[0]).toEqual({
        ...mockData[0],
        courses: ['Data Structures']
      })
    })
  })

  describe('TrackingService', () => {
    it('logs session', async () => {
      await trackingService.logSession('test-session', '127.0.0.1')
      expect(mockPrisma.session.upsert).toHaveBeenCalledWith({
        where: { sessionId: 'test-session' },
        update: { timestamp: expect.any(Date) },
        create: { 
          sessionId: 'test-session',
          ip: '127.0.0.1'
        }
      })
    })

    it('logs click', async () => {
      await trackingService.logClick('test-session', 'test-button')
      expect(mockPrisma.click.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'test-session',
          elementId: 'test-button',
          timestamp: expect.any(Date)
        }
      })
    })
  })
}) 