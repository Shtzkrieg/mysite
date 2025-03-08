import type { Education } from '../types/resume';

export async function getEducationItems(): Promise<Education[]> {
  try {
    const response = await fetch('http://localhost:3002/api/education');
    if (!response.ok) {
      throw new Error('Failed to fetch education data');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch education items:', error);
    throw error;
  }
} 