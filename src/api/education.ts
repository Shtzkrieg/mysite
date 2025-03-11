import type { Education } from '../types/resume';
import { API_URL } from '../config';

export async function getEducationItems(): Promise<Education[]> {
  try {
    const response = await fetch(`${API_URL}/education`);
    if (!response.ok) {
      throw new Error('Failed to fetch education data');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch education items:', error);
    throw error;
  }
} 