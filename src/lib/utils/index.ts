// Utilities for the application
import { Flashcard } from '../types';

/**
 * Format a date in a user-friendly format
 */
export function formatDate(date?: Date | string): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a time duration in a user-friendly format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate retention rate from review results
 */
export function calculateRetentionRate(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/**
 * Implementation of SuperMemo-2 (SM-2) spaced repetition algorithm
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
export function calculateNextReview(
  card: Flashcard,
  quality: number, // 0-5 where 0 is complete blackout, 5 is perfect recall
): {
  nextDate: Date;
  interval: number;
  repetitions: number;
  efactor: number;
} {
  // Default values if the card is new
  let repetitions = card.repetitions || 0;
  let efactor = card.efactor || 2.5; // Initial E-Factor
  let interval = card.interval || 0;
  
  // Minimum EFactor should be 1.3
  efactor = Math.max(1.3, efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  // If quality is less than 3, reset repetitions
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Increment repetitions
    repetitions += 1;
    
    // Calculate interval based on repetitions
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
  }
  
  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  
  return {
    nextDate,
    interval,
    repetitions,
    efactor,
  };
}

/**
 * Convert a quality rating (easy, medium, hard) to SM-2 quality (0-5)
 */
export function difficultyToQuality(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 3;
    case 'hard':
      return 1;
    default:
      return 3;
  }
}

/**
 * Generate a heatmap data structure based on review dates
 */
export function generateHeatmapData(dates: Date[], startDate?: Date, endDate?: Date): Record<string, number> {
  const start = startDate || new Date(new Date().setDate(new Date().getDate() - 365));
  const end = endDate || new Date();
  
  const heatmapData: Record<string, number> = {};
  
  // Initialize all dates in range with 0
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0];
    heatmapData[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count occurrences of each date
  dates.forEach(date => {
    const dateKey = date.toISOString().split('T')[0];
    if (heatmapData[dateKey] !== undefined) {
      heatmapData[dateKey] += 1;
    }
  });
  
  return heatmapData;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
} 