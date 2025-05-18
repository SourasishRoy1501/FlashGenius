'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FlashcardReview from '@/components/features/review/FlashcardReview';
import { useApp } from '@/lib/contexts/AppContext';
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { decks, updateDeck } = useApp();
  
  const deckId = params.id as string;
  const deck = decks.find(d => d.id === deckId);
  
  const handleComplete = () => {
    // Update deck review status to complete when all cards are reviewed
    if (deck) {
      updateDeck(deckId, { reviewStatus: 'complete' });
    }
    
    // Navigate back to decks page after a short delay
    setTimeout(() => {
      router.push('/decks');
    }, 2000);
  };
  
  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deck not found</h1>
          <p className="text-gray-600 mb-6">The deck you're looking for doesn't exist or has been removed.</p>
          <Link href="/decks">
            <Button variant="primary" icon={<FiArrowLeft />}>
              Back to Decks
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <Link href="/decks" className="mr-4">
            <Button variant="outline" size="sm" icon={<FiArrowLeft />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiBookOpen className="mr-3 text-primary-500" />
              Reviewing: {deck.name}
            </h1>
            {deck.description && (
              <p className="mt-2 text-gray-600 max-w-3xl">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="h-1 w-24 bg-primary-500 rounded-full"></div>
      </div>
      
      <FlashcardReview deckId={deckId} onComplete={handleComplete} />
    </div>
  );
} 