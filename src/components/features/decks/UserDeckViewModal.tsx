'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList, FiSearch, FiBarChart2, FiCheck, FiX } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useApp } from '@/lib/contexts/AppContext';
import { Deck, Flashcard } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface UserDeckViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
}

const UserDeckViewModal: React.FC<UserDeckViewModalProps> = ({ isOpen, onClose, deck }) => {
  const { flashcards, createFlashcard, updateFlashcard, deleteFlashcard } = useApp();
  
  // State for UI controls
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  
  // State for form values
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  
  // Filter flashcards for this deck
  const deckFlashcards = flashcards.filter(card => card.deckId === deck.id);
  
  // Filter flashcards based on search query
  const filteredFlashcards = deckFlashcards.filter(card => 
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate review statistics
  const calculateReviewStats = () => {
    const totalCards = deckFlashcards.length;
    if (totalCards === 0) return { easy: 0, medium: 0, hard: 0, mastery: 0 };
    
    const difficultyCount = {
      easy: 0,
      medium: 0,
      hard: 0
    };
    
    let totalPoints = 0;
    const maxPossiblePoints = totalCards * 10; // 10 points per card is maximum (all Easy)
    
    deckFlashcards.forEach(card => {
      if (card.difficulty) {
        difficultyCount[card.difficulty]++;
        
        // Add points based on difficulty
        if (card.difficulty === 'easy') totalPoints += 10;
        else if (card.difficulty === 'medium') totalPoints += 5;
        // hard cards get 0 points
      }
    });
    
    const masteryPercentage = Math.round((totalPoints / maxPossiblePoints) * 100);
    
    return {
      easy: Math.round((difficultyCount.easy / totalCards) * 100),
      medium: Math.round((difficultyCount.medium / totalCards) * 100),
      hard: Math.round((difficultyCount.hard / totalCards) * 100),
      mastery: masteryPercentage
    };
  };
  
  const reviewStats = calculateReviewStats();
  
  // Handle adding a new card
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    
    createFlashcard({
      question: newQuestion,
      answer: newAnswer,
      deckId: deck.id,
    });
    
    // Reset form
    setNewQuestion('');
    setNewAnswer('');
    setIsAddingCard(false);
  };
  
  // Start editing a card
  const handleStartEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };
  
  // Save edited card
  const handleSaveEdit = (cardId: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    
    updateFlashcard(cardId, {
      question: editQuestion,
      answer: editAnswer
    });
    
    setEditingCardId(null);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCardId(null);
  };
  
  // Handle deleting a card
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(cardId);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${deck.name} (${deckFlashcards.length} Cards)`}
      size="xl"
    >
      <div className="space-y-6 font-sans">
        {/* Simplified Stats Overview */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900 tracking-tight">Deck Statistics</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {showStats ? "Hide details" : "Show details"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mastery - Based on points */}
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Mastery</span>
                <span className="text-2xl font-bold text-gray-900">{reviewStats.mastery}%</span>
              </div>
              <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${reviewStats.mastery}%` }}
                ></div>
              </div>
            </div>
            
            {/* Total Cards */}
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Cards</span>
                <span className="text-2xl font-bold text-gray-900">{deck.cardsCount}</span>
              </div>
              <div className="mt-3 h-3 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (deck.cardsCount / Math.max(10, deck.cardsCount)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-md p-3 border border-green-100">
                    <div className="text-sm font-medium text-gray-700 mb-1">Easy (10pts)</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">{reviewStats.easy}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${reviewStats.easy}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-md p-3 border border-purple-100">
                    <div className="text-sm font-medium text-gray-700 mb-1">Medium (5pts)</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-purple-600">{reviewStats.medium}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${reviewStats.medium}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-md p-3 border border-red-100">
                    <div className="text-sm font-medium text-gray-700 mb-1">Hard (0pts)</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-red-600">{reviewStats.hard}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${reviewStats.hard}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search and Controls with Add Card Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="primary" 
              icon={<FiPlus />} 
              onClick={() => setIsAddingCard(true)}
            >
              Add Card
            </Button>
            <div className="bg-gray-100 rounded-md p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                title="Grid View"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                title="List View"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
        
        {/* Add Card Form */}
        <AnimatePresence>
          {isAddingCard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-lg shadow-md border border-primary-100"
            >
              <form onSubmit={handleAddCard}>
                <h3 className="text-lg font-semibold text-primary-800 mb-4 flex items-center">
                  <FiPlus className="mr-2" /> Add New Flashcard
                </h3>
                
                <div className="mb-4">
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <textarea
                    id="question"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter question..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    id="answer"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Enter answer..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium"
                    onClick={() => setIsAddingCard(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Cards Display */}
        {filteredFlashcards.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
              <FiSearch className="h-8 w-8 text-gray-400" />
            </div>
            {searchQuery ? (
              <div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No cards match your search</h3>
                <p className="mt-2 text-gray-500">Try a different search term or clear your filter</p>
              </div>
            ) : (
              <div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No cards in this deck yet</h3>
                <p className="mt-2 text-gray-500">Click "Add Card" to create your first flashcard</p>
                <div className="mt-4">
                  <Button 
                    variant="primary" 
                    icon={<FiPlus />} 
                    onClick={() => setIsAddingCard(true)}
                  >
                    Add First Card
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredFlashcards.map((card) => (
              <AnimatePresence key={card.id} mode="wait">
                {editingCardId === card.id ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white shadow-lg rounded-lg p-4 border-2 border-primary-300"
                  >
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        placeholder="Enter question..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        placeholder="Enter answer..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                        title="Cancel"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(card.id)}
                        className="p-1 rounded-full hover:bg-primary-100 text-primary-600"
                        title="Save"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`bg-white shadow-sm rounded-lg p-4 border hover:border-primary-200 hover:shadow transition-all ${
                      card.difficulty === 'easy' ? 'border-l-4 border-l-green-500' :
                      card.difficulty === 'medium' ? 'border-l-4 border-l-purple-500' :
                      card.difficulty === 'hard' ? 'border-l-4 border-l-red-500' : 'border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900">Question</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleStartEdit(card)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          title="Edit Card"
                        >
                          <FiEdit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          title="Delete Card"
                        >
                          <FiTrash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 mb-3 min-h-[60px]">
                      <p className="text-gray-700 font-medium leading-relaxed">{card.question}</p>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">Answer</h3>
                    <div className="bg-gray-50 rounded p-3 min-h-[60px]">
                      <p className="text-gray-700 leading-relaxed">{card.answer}</p>
                    </div>
                    
                    {card.difficulty && (
                      <div className="mt-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          card.difficulty === 'medium' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserDeckViewModal; 