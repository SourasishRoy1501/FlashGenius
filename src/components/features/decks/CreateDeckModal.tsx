'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useApp } from '@/lib/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ isOpen, onClose }) => {
  const { createDeck, createFlashcard } = useApp();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  
  const [cards, setCards] = useState<Array<{ question: string; answer: string }>>([
    { question: '', answer: '' }
  ]);
  
  const addCard = () => {
    setCards([...cards, { question: '', answer: '' }]);
  };
  
  const updateCard = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };
  
  const removeCard = (index: number) => {
    if (cards.length === 1) return;
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newDeck = {
      name,
      description,
      category,
      isPublic,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      cardsCount: 0,
      dueCardsCount: 0,
      reviewStatus: 'pending' as const,
    };
    
    createDeck(newDeck);
    
    const deckId = `deck-${new Date().getTime()}`;
    
    const validCards = cards.filter(card => card.question.trim() && card.answer.trim());
    
    validCards.forEach(card => {
      createFlashcard({
        question: card.question,
        answer: card.answer,
        deckId,
      });
    });
    
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setIsPublic(false);
    setTags('');
    setCards([{ question: '', answer: '' }]);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Deck"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="font-sans">
        {/* Deck Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4 text-primary-700 border-b border-primary-100 pb-2">
            Deck Information
          </h3>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter deck name"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your deck"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="Languages">Languages</option>
                <option value="Programming">Programming</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. spanish, vocabulary, beginner"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 transition-all duration-200"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Make this deck public</span>
            </label>
          </div>
        </div>
        
        {/* Cards */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-primary-700 border-b border-primary-100 pb-2">Cards</h3>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={addCard} 
              type="button"
              icon={<FiPlus />}
              className="transition-all duration-300 transform hover:scale-105"
            >
              Add Card
            </Button>
          </div>
          
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-primary-600">Card {index + 1}</h4>
                  {cards.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      onClick={() => removeCard(index)}
                    >
                      <FiTrash2 />
                    </motion.button>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    value={card.question}
                    onChange={(e) => updateCard(index, 'question', e.target.value)}
                    placeholder="Enter question"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                    value={card.answer}
                    onChange={(e) => updateCard(index, 'answer', e.target.value)}
                    placeholder="Enter answer"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            className="text-center py-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {cards.length > 0 ? (
              <p>{cards.length} card{cards.length !== 1 && 's'} added</p>
            ) : (
              <p>Add at least one card to your deck</p>
            )}
          </motion.div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              onClose();
            }}
            type="button"
            className="transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            icon={<FiCheckCircle />}
            className="transition-all duration-300 transform hover:scale-105"
          >
            Create Deck
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateDeckModal; 