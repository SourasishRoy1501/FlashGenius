export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
  lastReviewed?: Date;
  nextReviewDate?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  repetitions?: number;
  interval?: number;
  efactor?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Deck type
export interface Deck {
  id: string;
  name: string;
  description?: string;
  category?: string;
  cardsCount: number;
  dueCardsCount: number;
  isPublic?: boolean;
  reviewStatus?: 'pending' | 'incomplete' | 'complete';
  authorId?: string;
  rating?: number;
  tags?: string[];
  collaborators?: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
  originalDeckId?: string;
}

// Review session type
export interface ReviewSession {
  id: string;
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  reviews: ReviewResult[];
}

// Review result type
export interface ReviewResult {
  id: string;
  flashcardId: string;
  sessionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCorrect: boolean;
  timeSpent: number;
  date: Date;
}

// User type
export interface User {
  id: string;
  name: string;
  email?: string;
  decks: Deck[];
  stats: UserStats;
}

// User stats type
export interface UserStats {
  totalCards: number;
  totalDecks: number;
  cardsLearned: number;
  reviewStreak: number;
  lastReviewDate?: Date;
  retentionRate: number;
}

// Import options type
export interface ImportOptions {
  source: 'googleSheets';
  url?: string;
  targetDeck?: string;
  columnMapping: {
    question: string;
    answer: string;
    [key: string]: string;
  };
} 