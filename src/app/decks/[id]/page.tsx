'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiArrowRight, FiClock, FiTag, FiInfo } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FlashcardForm from '@/components/features/flashcards/FlashcardForm';
import { useApp } from '@/lib/contexts/AppContext';
import { formatDate } from '@/lib/utils';

export default function DeckDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { decks, flashcards, deleteFlashcard } = useApp();
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const deckId = params.id as string;
  const deck = decks.find(d => d.id === deckId);
  const deckFlashcards = flashcards.filter(card => card.deckId === deckId);
  
  const filteredFlashcards = deckFlashcards.filter(card => 
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteFlashcard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(id);
    }
  };
  
  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Deck Not Found</h1>
        <p className="text-gray-600 mb-8">The deck you're looking for doesn't exist or has been deleted.</p>
        <Link href="/decks">
          <Button variant="primary">Back to Decks</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Deck Header */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center mb-2">
              {deck.category && (
                <span className="badge badge-primary mr-2">{deck.category}</span>
              )}
              {deck.dueCardsCount > 0 && (
                <span className="badge badge-warning">
                  {deck.dueCardsCount} due
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
            {deck.description && (
              <p className="mt-2 text-gray-600">{deck.description}</p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href={`/decks/${deckId}/review`}>
              <Button variant="primary" icon={<FiArrowRight />}>
                Start Review
              </Button>
            </Link>
            <Link href={`/decks/${deckId}/edit`}>
              <Button variant="outline" icon={<FiEdit />}>
                Edit Deck
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>Updated {formatDate(deck.updatedAt)}</span>
          </div>
          
          <div className="flex items-center">
            <FiInfo className="mr-1" />
            <span>{deck.cardsCount} cards</span>
          </div>
          
          {deck.tags && deck.tags.length > 0 && (
            <div className="flex items-center">
              <FiTag className="mr-1" />
              <span>{deck.tags.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Flashcard Management */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              icon={<FiPlus />}
              onClick={() => setIsAddingCard(true)}
            >
              Add Flashcard
            </Button>
          </div>
        </div>
        
        {/* Add/Edit Flashcard Form */}
        <AnimatePresence>
          {(isAddingCard || editingCardId) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-gray-50 rounded-xl p-6 overflow-hidden"
            >
              <FlashcardForm
                deckId={deckId}
                flashcard={editingCardId ? flashcards.find(card => card.id === editingCardId) : undefined}
                onSave={() => {
                  setIsAddingCard(false);
                  setEditingCardId(null);
                }}
                onCancel={() => {
                  setIsAddingCard(false);
                  setEditingCardId(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Flashcards List */}
        {filteredFlashcards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiInfo className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No flashcards found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No flashcards match your search criteria "${searchQuery}"`
                : 'This deck does not have any flashcards yet'}
            </p>
            {!searchQuery && (
              <Button 
                variant="primary" 
                icon={<FiPlus />} 
                onClick={() => setIsAddingCard(true)}
              >
                Add your first flashcard
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcards.map((card) => (
              <Card key={card.id} isHoverable className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 mb-2">Question:</h3>
                    <p className="text-gray-700 mb-4">{card.question}</p>
                    
                    <h3 className="font-bold text-gray-800 mb-2">Answer:</h3>
                    <p className="text-gray-700">{card.answer}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {card.lastReviewed && (
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          <span>Last reviewed: {formatDate(card.lastReviewed)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
                        onClick={() => setEditingCardId(card.id)}
                        aria-label="Edit flashcard"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteFlashcard(card.id)}
                        aria-label="Delete flashcard"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 