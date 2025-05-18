'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiAward, FiTrendingUp, FiHeart, FiRotateCcw, FiVolume2, FiBarChart2 } from 'react-icons/fi';
import { useApp } from '@/lib/contexts/AppContext';
import Button from '@/components/ui/Button';
import { Flashcard } from '@/lib/types';
import { difficultyToQuality } from '@/lib/utils';
import styles from './FlashcardReview.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FlashcardReviewProps {
  deckId: string;
  onComplete?: () => void;
}

const FlashcardReview: React.FC<FlashcardReviewProps> = ({ deckId, onComplete }) => {
  const { flashcards, startReview, endReview, recordReview } = useApp();
  const router = useRouter();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [cardStartTime, setCardStartTime] = useState<Date | null>(null);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  // Filter flashcards for the current deck
  const deckFlashcards = flashcards.filter(card => card.deckId === deckId);
  
  // Initialize review session
  useEffect(() => {
    if (deckFlashcards.length > 0) {
      const id = startReview(deckId);
      setSessionId(id);
      setStartTime(new Date());
      setCardStartTime(new Date());
    }
    
    return () => {
      if (sessionId) {
        endReview(sessionId);
      }
    };
  }, [deckId, deckFlashcards.length, startReview, endReview]);
  
  // Check if review is complete
  const isReviewComplete = currentIndex >= deckFlashcards.length;
  
  // Current card
  const currentCard = isReviewComplete ? null : deckFlashcards[currentIndex];
  
  // Handle card flip
  const handleFlip = () => {
    setIsRevealed(!isRevealed);
  };
  
  // Handle read aloud
  const handleReadAloud = () => {
    if (!currentCard) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance with card text
    const utterance = new SpeechSynthesisUtterance(
      isRevealed ? currentCard.answer : currentCard.question
    );
    
    // Set speaking state
    setIsReading(true);
    
    // Add event listener for when speech ends
    utterance.onend = () => {
      setIsReading(false);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };
  
  // Stop reading aloud
  const stopReadAloud = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };
  
  // Handle difficulty rating
  const handleDifficultyRating = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard || !sessionId || !cardStartTime) return;
    
    // Calculate time spent on card
    const timeSpent = new Date().getTime() - cardStartTime.getTime();
    
    // Record the review
    const isCorrect = difficulty !== 'hard'; // Simplistic approach for demo
    
    // Log for debugging
    console.log('Recording review:', {
      sessionId,
      flashcardId: currentCard.id,
      isCorrect,
      difficulty,
      timeSpent
    });
    
    // Record the review in the context
    recordReview(sessionId, currentCard.id, isCorrect, difficulty, timeSpent);
    
    // Update points based on difficulty and correctness
    let pointsToAdd = 0;
    
    switch (difficulty) {
      case 'easy':
        pointsToAdd = 10;
        if (streak >= 3) pointsToAdd += 5; // Streak bonus
        break;
      case 'medium':
        pointsToAdd = 5;
        break;
      case 'hard':
        pointsToAdd = 2;
        break;
    }
    
    // Update streak
    if (isCorrect) {
      setStreak(prev => prev + 1);
      setFeedback(getPositiveFeedback(streak));
    } else {
      setStreak(0);
      setFeedback("Keep practicing! You'll get it next time.");
    }
    
    // Add points
    setPoints(prev => prev + pointsToAdd);
    
    // Show animation
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
    
    // Add to reviewed cards
    setReviewedCards(prev => [...prev, currentCard.id]);
    
    // Stop any ongoing speech
    stopReadAloud();
    
    // Move to next card
    setTimeout(() => {
      setIsRevealed(false);
      setCurrentIndex(prev => prev + 1);
      setCardStartTime(new Date());
    }, 1000);
  };
  
  // Get positive feedback based on streak
  const getPositiveFeedback = (currentStreak: number): string => {
    const feedbackOptions = [
      "Good job!",
      "Well done!",
      "Excellent!",
      "You're on fire!",
      "Unstoppable!",
      "Incredible streak!",
      "Legendary!",
    ];
    
    const index = Math.min(currentStreak, feedbackOptions.length - 1);
    return feedbackOptions[index];
  };
  
  // Calculate progress percentage
  const progressPercentage = deckFlashcards.length > 0
    ? (reviewedCards.length / deckFlashcards.length) * 100
    : 0;
  
  // Handle completion
  useEffect(() => {
    if (isReviewComplete && onComplete) {
      onComplete();
    }
  }, [isReviewComplete, onComplete]);
  
  if (deckFlashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">No flashcards found</h3>
        <p className="text-gray-600 mb-6">This deck doesn't have any flashcards yet.</p>
        <Button variant="primary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }
  
  if (isReviewComplete) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200"
        >
          <div className="h-24 w-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
            <FiAward className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Review Complete!</h3>
          <p className="text-lg text-gray-600 mb-8">
            You've reviewed all {deckFlashcards.length} cards in this deck.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary-100 shadow-sm">
              <div className="text-2xl font-bold text-primary-600">{points}</div>
              <div className="text-sm text-gray-500">Points Earned</div>
            </div>
            <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl p-5 border border-accent-100 shadow-sm">
              <div className="text-2xl font-bold text-accent-600">{streak}</div>
              <div className="text-sm text-gray-500">Highest Streak</div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <Button variant="primary" fullWidth onClick={() => window.history.back()}>
                Back to Deck
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                icon={<FiRotateCcw />}
                onClick={() => {
                  setCurrentIndex(0);
                  setReviewedCards([]);
                  setStreak(0);
                  setPoints(0);
                  setStartTime(new Date());
                  setCardStartTime(new Date());
                }}
              >
                Review Again
              </Button>
            </div>
            <Button 
              variant="success" 
              fullWidth 
              icon={<FiBarChart2 />}
              onClick={() => router.push('/analytics')}
            >
              View Analytics
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress and Stats Bar */}
      <div className={styles.statsContainer}>
        <div className="text-sm font-medium text-gray-500">
          Card {currentIndex + 1} of {deckFlashcards.length}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FiTrendingUp className="text-primary-500 mr-1" />
            <span className="font-semibold">{points} pts</span>
          </div>
          <div className="flex items-center">
            <FiHeart className="text-red-500 mr-1" />
            <span className="font-semibold">{streak} streak</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Flashcard */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className={styles.flashcardContainer}
                animate={{ 
                  scale: isRevealed ? [1, 1.02, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Front side (Question) */}
                {!isRevealed && (
                  <motion.div 
                    className={styles.cardFace}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className={styles.questionTitle}>Question</h2>
                    <div className={styles.questionContent}>
                      {currentCard.question}
                    </div>
                  </motion.div>
                )}
                
                {/* Back side (Answer) */}
                {isRevealed && (
                  <motion.div 
                    className={styles.cardFace}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className={styles.questionTitle}>Answer</h2>
                    <div className={styles.questionContent}>
                      {currentCard.answer}
                    </div>
                  </motion.div>
                )}
                
                <div className={styles.buttonContainer}>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={handleFlip}
                  >
                    {isRevealed ? "Show Question" : "Reveal Answer"}
                  </Button>
                  
                  <Button
                    variant={isReading ? "danger" : "success"}
                    size="lg"
                    icon={<FiVolume2 />}
                    onClick={isReading ? stopReadAloud : handleReadAloud}
                  >
                    {isReading ? "Stop Reading" : "Read Aloud"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Feedback Animation */}
        <AnimatePresence>
          {showAnimation && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.feedbackAnimation}
            >
              <span className="text-lg font-bold">{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Difficulty Buttons */}
      <div className={styles.difficultyButtons}>
        <button
          className={styles.hardButton}
          onClick={() => handleDifficultyRating('hard')}
        >
          <FiX size={18} className="mr-2" /> Hard
        </button>
        <button
          className={styles.mediumButton}
          onClick={() => handleDifficultyRating('medium')}
        >
          Medium
        </button>
        <button
          className={styles.easyButton}
          onClick={() => handleDifficultyRating('easy')}
        >
          <FiCheck size={18} className="mr-2" /> Easy
        </button>
      </div>
      
      {/* Timer */}
      <div className={styles.timer}>
        <FiClock className="mr-2" />
        <span>Time spent on this card: </span>
        <Timer startTime={cardStartTime} />
      </div>
    </div>
  );
};

// Timer component
const Timer: React.FC<{ startTime: Date | null }> = ({ startTime }) => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    if (!startTime) return;
    
    // Set initial time
    setTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    
    // Update time every second
    const interval = setInterval(() => {
      setTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return <span className="ml-2 font-mono font-medium">{formatTime(time)}</span>;
};

export default FlashcardReview; 