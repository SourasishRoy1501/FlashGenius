'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useApp } from '@/lib/contexts/AppContext';
import { Flashcard } from '@/lib/types';

interface FlashcardFormProps {
  deckId: string;
  flashcard?: Flashcard;
  onSave?: () => void;
  onCancel?: () => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  deckId,
  flashcard,
  onSave,
  onCancel,
}) => {
  const { createFlashcard, updateFlashcard } = useApp();
  const [question, setQuestion] = useState(flashcard?.question || '');
  const [answer, setAnswer] = useState(flashcard?.answer || '');
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!flashcard;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required');
      return;
    }
    
    if (isEditing && flashcard) {
      updateFlashcard(flashcard.id, {
        question,
        answer,
      });
    } else {
      createFlashcard({
        question,
        answer,
        deckId,
      });
    }
    
    if (onSave) {
      onSave();
    }
    
    // Reset form if not redirecting
    if (!onSave) {
      setQuestion('');
      setAnswer('');
      setError('');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className={`px-4 py-1 text-sm rounded-md ${
                  !isPreview
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setIsPreview(false)}
              >
                Edit
              </button>
              <button
                type="button"
                className={`px-4 py-1 text-sm rounded-md ${
                  isPreview
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setIsPreview(true)}
              >
                Preview
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          {!isPreview ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  id="question"
                  rows={3}
                  className="input w-full"
                  placeholder="Enter the question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  id="answer"
                  rows={5}
                  className="input w-full"
                  placeholder="Enter the answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-64">
                <div className="h-full flex flex-col">
                  <h4 className="font-bold text-gray-700 mb-2">Question</h4>
                  <div className="flex-grow p-4 bg-gray-50 rounded-md overflow-auto">
                    {question || <span className="text-gray-400">Question preview...</span>}
                  </div>
                </div>
              </Card>
              
              <Card className="h-64">
                <div className="h-full flex flex-col">
                  <h4 className="font-bold text-gray-700 mb-2">Answer</h4>
                  <div className="flex-grow p-4 bg-gray-50 rounded-md overflow-auto">
                    {answer || <span className="text-gray-400">Answer preview...</span>}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              icon={<FiX />}
            >
              Cancel
            </Button>
          )}
          
          <Button
            variant="primary"
            type="submit"
            icon={isEditing ? <FiSave /> : <FiPlus />}
          >
            {isEditing ? 'Save Changes' : 'Add Flashcard'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardForm; 