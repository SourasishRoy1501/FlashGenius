'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList, FiSearch, FiLock, FiGlobe, FiBarChart2, FiCopy, FiUser, FiStar } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useApp } from '@/lib/contexts/AppContext';
import { Deck, Flashcard } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DeckViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
}

const DeckViewModal: React.FC<DeckViewModalProps> = ({ isOpen, onClose, deck }) => {
  const { flashcards, importDeck, user } = useApp();
  const [deckCards, setDeckCards] = useState<Flashcard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(6);
  
  // Determine if this is a community deck (not owned by current user)
  const isCommunityDeck = deck.authorId !== user?.id;
  
  useEffect(() => {
    // Get cards for this deck
    const deckFlashcards = flashcards.filter(card => card.deckId === deck.id);
    
    // If no cards found, generate dummy cards to match the deck's card count
    if (deckFlashcards.length === 0 && deck.cardsCount > 0) {
      const dummyCards = Array.from({ length: deck.cardsCount }, (_, i) => ({
        id: `dummy-${deck.id}-${i}`,
        question: `Sample question ${i + 1} for ${deck.name}`,
        answer: `Sample answer ${i + 1} for this flashcard`,
        deckId: deck.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      setDeckCards(dummyCards);
    } else {
      setDeckCards(deckFlashcards);
    }
  }, [deck.id, deck.cardsCount, deck.name, flashcards]);
  
  // Filter cards based on search query
  const filteredCards = searchQuery
    ? deckCards.filter(
        card =>
          card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deckCards;
  
  // Pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Handle fork/clone deck
  const handleForkDeck = () => {
    const newDeckId = importDeck(deck);
    onClose();
    // Show success message (in a real app, use a proper toast notification)
    alert(`Deck "${deck.name}" has been forked to your collection!`);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deck.name}
      size="xl"
    >
      <div className="p-1">
        {/* Deck Info */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {deck.category && (
              <span className="badge badge-primary">{deck.category}</span>
            )}
            <span className={`badge ${deck.isPublic ? 'badge-secondary' : 'badge-default'} flex items-center`}>
              {deck.isPublic ? (
                <><FiGlobe className="mr-1" /> Public</>
              ) : (
                <><FiLock className="mr-1" /> Private</>
              )}
            </span>
            {deck.tags && deck.tags.map(tag => (
              <span key={tag} className="badge badge-outline">{tag}</span>
            ))}
          </div>
          
          {/* Author info for community decks */}
          {isCommunityDeck && deck.authorId && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <FiUser />
              <span>
                Created by: {deck.authorId === 'user-1' ? 'John Doe' : 
                           deck.authorId === 'user-2' ? 'Jane Smith' :
                           deck.authorId === 'user-3' ? 'Robert Johnson' :
                           deck.authorId === 'user-4' ? 'Emily Chen' : 'Unknown User'}
              </span>
            </div>
          )}
          
          {deck.description && (
            <p className="text-gray-600 mb-4">{deck.description}</p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Cards</div>
              <div className="text-xl font-bold">{deck.cardsCount}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="text-xl font-bold flex items-center">
                {deck.rating ? deck.rating.toFixed(1) : 'N/A'}
                {deck.rating && (
                  <div className="ml-2 flex items-center text-yellow-400">
                    <FiStar className={deck.rating >= 1 ? "fill-yellow-400" : ""} />
                    <FiStar className={deck.rating >= 2 ? "fill-yellow-400" : ""} />
                    <FiStar className={deck.rating >= 3 ? "fill-yellow-400" : ""} />
                    <FiStar className={deck.rating >= 4 ? "fill-yellow-400" : ""} />
                    <FiStar className={deck.rating >= 5 ? "fill-yellow-400" : ""} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Cards Controls */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
        
        {/* Cards Display */}
        {currentCards.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No cards found in this deck.
          </div>
        ) : (
          <div className={`${view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}`}>
            <AnimatePresence>
              {currentCards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Q: {card.question}</h4>
                  <div className="pl-2 border-l-2 border-primary-300 text-gray-700">
                    <p>A: {card.answer}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-gray-200">
          {isCommunityDeck ? (
            <Button 
              variant="primary"
              icon={<FiCopy />}
              onClick={handleForkDeck}
              className="transition-all duration-300 transform hover:scale-105"
            >
              Fork This Deck
            </Button>
          ) : (
            <Link href={`/decks/${deck.id}/review`}>
              <Button 
                variant="primary"
                icon={<FiBarChart2 />}
                className="transition-all duration-300 transform hover:scale-105"
              >
                Start Review
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="transition-all duration-200"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeckViewModal; 