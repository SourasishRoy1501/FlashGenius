'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deck, Flashcard, User, ReviewSession } from '../types';
import { MOCK_DECKS, MOCK_FLASHCARDS, MOCK_REVIEW_SESSIONS, MOCK_USER, COMMUNITY_DECKS } from '../constants/mockData';

interface AppContextType {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Decks
  decks: Deck[];
  selectedDeck: Deck | null;
  setSelectedDeck: (deck: Deck | null) => void;
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  
  // Flashcards
  flashcards: Flashcard[];
  createFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  
  // Reviews
  reviewSessions: ReviewSession[];
  startReview: (deckId: string) => string; 
  endReview: (sessionId: string) => void;
  recordReview: (sessionId: string, flashcardId: string, isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard', timeSpent: number) => void;
  
  // Marketplace
  communityDecks: Deck[];
  importDeck: (deck: Deck) => string; 
  publishDeck: (deckId: string) => void; 
  unpublishDeck: (deckId: string) => void; 
  incrementDeckViews: (deckId: string) => void; 
  isForked: (originalDeckId: string) => boolean; 
  
  // Google Sheets Import
  importFromGoogleSheets: (sheetUrl: string, deckId: string, columnMapping: Record<string, string>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [decks, setDecks] = useState<Deck[]>(MOCK_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
  const [reviewSessions, setReviewSessions] = useState<ReviewSession[]>(MOCK_REVIEW_SESSIONS);
  const [communityDecks, setCommunityDecks] = useState<Deck[]>(COMMUNITY_DECKS);
  
  // Check if user is authenticated
  const isAuthenticated = Boolean(user);
  
  // Deck operations
  const createDeck = (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeck: Deck = {
      ...deck,
      id: `deck-${decks.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDecks([...decks, newDeck]);
  };
  
  const updateDeck = (id: string, updates: Partial<Deck>) => {
    setDecks(decks.map(deck => 
      deck.id === id 
        ? { ...deck, ...updates, updatedAt: new Date() } 
        : deck
    ));
  };
  
  const deleteDeck = (id: string) => {
    setDecks(decks.filter(deck => deck.id !== id));
    // Also delete associated flashcards
    setFlashcards(flashcards.filter(card => card.deckId !== id));
  };
  
  const createFlashcard = (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `card-${flashcards.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setFlashcards([...flashcards, newFlashcard]);
    
    const deck = decks.find(d => d.id === flashcard.deckId);
    if (deck) {
      updateDeck(deck.id, { cardsCount: deck.cardsCount + 1 });
    }
  };
  
  const updateFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(flashcards.map(card => 
      card.id === id 
        ? { ...card, ...updates, updatedAt: new Date() } 
        : card
    ));
  };
  
  const deleteFlashcard = (id: string) => {
    const cardToDelete = flashcards.find(card => card.id === id);
    setFlashcards(flashcards.filter(card => card.id !== id));
    
    // Update deck card count
    if (cardToDelete) {
      const deck = decks.find(d => d.id === cardToDelete.deckId);
      if (deck) {
        updateDeck(deck.id, { cardsCount: deck.cardsCount - 1 });
      }
    }
  };
  
  const startReview = (deckId: string): string => {
    const sessionId = `session-${reviewSessions.length + 1}`;
    const newSession: ReviewSession = {
      id: sessionId,
      deckId,
      startTime: new Date(),
      cardsReviewed: 0,
      correctAnswers: 0,
      reviews: [],
    };
    
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      updateDeck(deckId, { reviewStatus: 'incomplete' });
    }
    
    setReviewSessions([...reviewSessions, newSession]);
    return sessionId;
  };
  
  const endReview = (sessionId: string) => {
    const session = reviewSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Update the session with end time
    const updatedSession = {
      ...session,
      endTime: new Date()
    };
    
    setReviewSessions(reviewSessions.map(s => 
      s.id === sessionId ? updatedSession : s
    ));
    
    const deck = decks.find(d => d.id === session.deckId);
    if (deck) {
      const deckFlashcards = flashcards.filter(card => card.deckId === deck.id);
      const reviewStatus = session.cardsReviewed >= deckFlashcards.length ? 'complete' : 'incomplete';
      updateDeck(deck.id, { reviewStatus });
    }
  };
  
  const recordReview = (
    sessionId: string, 
    flashcardId: string, 
    isCorrect: boolean, 
    difficulty: 'easy' | 'medium' | 'hard',
    timeSpent: number
  ) => {
    const session = reviewSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const newReview = {
      id: `review-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Ensure unique ID
      flashcardId,
      sessionId,
      difficulty,
      isCorrect,
      timeSpent,
      date: new Date(),
    };
    
    const updatedSession = {
      ...session,
      cardsReviewed: session.cardsReviewed + 1,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      reviews: [...session.reviews, newReview]
    };
    
    const updatedSessions = reviewSessions.map(s => 
      s.id === sessionId ? updatedSession : s
    );
    
    setReviewSessions([...updatedSessions]);
    
    updateFlashcard(flashcardId, {
      lastReviewed: new Date(),
      difficulty,
      nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    });
  };
  
  // Marketplace operations
  const importDeck = (deck: Deck): string => {
    // Generate new ID for the imported deck
    const newDeckId = `deck-${Date.now()}`;
    
    // Create a copy of the deck with new ID
    const importedDeck: Deck = {
      ...deck,
      id: newDeckId,
      authorId: user?.id, // Set the current user as author
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false, // Set to private by default when forking
      dueCardsCount: deck.cardsCount, 
      originalDeckId: deck.id, // Store the ID of the original deck that was forked
    };
    
    setDecks([...decks, importedDeck]);
    
    // Find and copy all flashcards from the original deck
    let sourceCards: Flashcard[] = [];
    
    // Check if it's a community deck
    const communityDeckCards = flashcards.filter(card => card.deckId === deck.id);
    
    if (communityDeckCards.length > 0) {
      sourceCards = communityDeckCards;
    } else {
      sourceCards = Array.from({ length: deck.cardsCount }, (_, i) => ({
        id: `placeholder-${i}`,
        question: `Card ${i + 1} Question`,
        answer: `Card ${i + 1} Answer`,
        deckId: deck.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
    
    const newCards = sourceCards.map(card => ({
      ...card,
      id: `card-${flashcards.length + Math.floor(Math.random() * 1000) + 1 + Math.floor(Math.random() * 1000)}`,
      deckId: newDeckId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReviewed: undefined, 
      nextReviewDate: undefined,
      difficulty: undefined,
      repetitions: 0,
      interval: 0,
      efactor: 2.5, 
    }));
    
    // Add the new cards to the flashcards state
    setFlashcards([...flashcards, ...newCards]);
    
    // Return the new deck ID
    return newDeckId;
  };
  
  // Publish deck to marketplace (make it public)
  const publishDeck = (deckId: string) => {
    // Update the deck to be public
    updateDeck(deckId, { isPublic: true });
    
    // Get the updated deck
    const deckToPublish = decks.find(d => d.id === deckId);
    
    // If it's not already in community decks and it exists, add it
    if (deckToPublish && !communityDecks.some(d => d.id === deckId)) {
      // Initialize view count if not present
      if (deckToPublish.viewCount === undefined) {
        deckToPublish.viewCount = 0;
      }
      setCommunityDecks([...communityDecks, deckToPublish]);
    }
  };
  
  // Unpublish deck from marketplace (make it private)
  const unpublishDeck = (deckId: string) => {
    // Update the deck to be private
    updateDeck(deckId, { isPublic: false });
    
    // Remove from community decks if present
    setCommunityDecks(communityDecks.filter(d => d.id !== deckId));
  };
  
  // Increment view count for a deck
  const incrementDeckViews = (deckId: string) => {
    // Find the deck in community decks
    const communityDeck = communityDecks.find(d => d.id === deckId);
    
    if (communityDeck) {
      // Create updated deck with incremented view count
      const updatedDeck = {
        ...communityDeck,
        viewCount: (communityDeck.viewCount || 0) + 1,
        updatedAt: new Date()
      };
      
      // Update community decks
      setCommunityDecks(
        communityDecks.map(d => d.id === deckId ? updatedDeck : d)
      );
      
      // Also update in main decks array if present
      const mainDeck = decks.find(d => d.id === deckId);
      if (mainDeck) {
        updateDeck(deckId, { viewCount: (mainDeck.viewCount || 0) + 1 });
      }
    }
  };
  
  // Check if a deck has already been forked by the current user
  const isForked = (originalDeckId: string): boolean => {
    if (!user) return false;
    
    // Check if any of the user's decks has this originalDeckId
    return decks.some(deck => 
      deck.originalDeckId === originalDeckId && 
      deck.authorId === user.id
    );
  };
  
  // Google Sheets import
  const importFromGoogleSheets = async (
    sheetUrl: string,
    deckId: string,
    columnMapping: Record<string, string>
  ): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newCards: Flashcard[] = [
          {
            id: `card-${flashcards.length + 1}`,
            question: 'Imported Question 1',
            answer: 'Imported Answer 1',
            deckId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: `card-${flashcards.length + 2}`,
            question: 'Imported Question 2',
            answer: 'Imported Answer 2',
            deckId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: `card-${flashcards.length + 3}`,
            question: 'Imported Question 3',
            answer: 'Imported Answer 3',
            deckId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        setFlashcards([...flashcards, ...newCards]);
        
        // Update deck
        const deck = decks.find(d => d.id === deckId);
        if (deck) {
          updateDeck(deck.id, { cardsCount: deck.cardsCount + newCards.length });
        }
        
        resolve();
      }, 1500);
    });
  };
  
  const value = {
    // User
    user,
    isAuthenticated,
    
    // Decks
    decks,
    selectedDeck,
    setSelectedDeck,
    createDeck,
    updateDeck,
    deleteDeck,
    
    // Flashcards
    flashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    
    // Reviews
    reviewSessions,
    startReview,
    endReview,
    recordReview,
    
    // Marketplace
    communityDecks,
    importDeck,
    publishDeck,
    unpublishDeck,
    incrementDeckViews,
    isForked,
    
    // Google Sheets Import
    importFromGoogleSheets,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 