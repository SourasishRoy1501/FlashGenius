'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useApp } from '@/lib/contexts/AppContext';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';

interface ImportDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportDropzone: React.FC<ImportDropzoneProps> = ({ isOpen, onClose }) => {
  const { createDeck, createFlashcard, decks } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ deckName: string; cardCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store the current file processing state
  const [processingState, setProcessingState] = useState<{
    file: File | null;
    parsedData: Array<Record<string, string>> | null;
    deckName: string | null;
    step: 'idle' | 'parsing' | 'namingDeck' | 'creatingDeck' | 'creatingCards' | 'complete';
  }>({
    file: null,
    parsedData: null,
    deckName: null,
    step: 'idle'
  });
  
  // State for custom deck name input
  const [customDeckName, setCustomDeckName] = useState('');

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  // Step 1: Parse the file
  const parseFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProcessingState({
      file,
      parsedData: null,
      deckName: null,
      step: 'parsing'
    });

    try {
      // Check file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv',
        'text/plain' // .txt (assuming CSV format)
      ];

      // More permissive file type checking
      const isValidType = validTypes.includes(file.type) || 
                         file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');

      if (!isValidType) {
        throw new Error('Invalid file type. Please upload a CSV or Excel file.');
      }

      // Read file
      const data = await readFileAsync(file);
      
      // Parse data based on file type
      let parsedData;
      if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/csv' || file.type === 'text/plain') {
        parsedData = parseCSV(data as string);
      } else {
        parsedData = parseExcel(data as ArrayBuffer);
      }

      // Validate data structure
      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in the file.');
      }

      // Check for required columns
      const firstRow = parsedData[0];
      const hasQuestion = 'question' in firstRow || 'Question' in firstRow;
      const hasAnswer = 'answer' in firstRow || 'Answer' in firstRow;

      if (!hasQuestion || !hasAnswer) {
        throw new Error('File must contain "question" and "answer" columns.');
      }
      setIsProcessing(false);
      setProcessingState({
        file,
        parsedData,
        deckName: null,
        step: 'namingDeck'
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsProcessing(false);
      setIsDragging(false);
      setProcessingState({
        file: null,
        parsedData: null,
        deckName: null,
        step: 'idle'
      });
    }
  }, []);

  useEffect(() => {
    if (processingState.step === 'creatingDeck' && processingState.deckName && processingState.parsedData) {
      const createDeckAndCards = async () => {
        try {
          const { deckName, parsedData, file } = processingState;
          // Ensure all values are non-null before proceeding
          if (!deckName || !parsedData || !file) {
            throw new Error('Missing data for deck creation');
          }
          
          const newDeck = {
            name: deckName,
            description: `Imported from ${file.name} on ${new Date().toLocaleDateString()}`,
            category: 'Imported',
            isPublic: false,
            cardsCount: parsedData.length,
            dueCardsCount: parsedData.length,
            reviewStatus: 'pending' as 'pending' | 'incomplete' | 'complete',
            tags: []
          };

          createDeck(newDeck);
          
          setProcessingState(prev => ({
            ...prev,
            step: 'creatingCards'
          }));
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create deck');
          setIsProcessing(false);
          setIsDragging(false);
          setProcessingState({
            file: null,
            parsedData: null,
            deckName: null,
            step: 'idle'
          });
        }
      };
      
      createDeckAndCards();
    }
  }, [processingState.step, processingState.deckName, processingState.parsedData, createDeck]);

  // Handle deck name submission
  const handleDeckNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customDeckName.trim()) {
      return;
    }
    
    setProcessingState(prev => ({
      ...prev,
      deckName: customDeckName.trim(),
      step: 'creatingDeck'
    }));
  };

  useEffect(() => {
    if (processingState.step !== 'creatingCards' || !processingState.deckName || !processingState.parsedData || !processingState.file) {
      return;
    }

    const createCards = async () => {
      try {
        const createdDeck = decks.find(d => d.name === processingState.deckName);
        
        if (!createdDeck) {
          return;
        }
        
        let cardCount = 0;
        const parsedData = processingState.parsedData as Array<Record<string, string>>;
        
        for (const row of parsedData) {
          const question = row.question || row.Question;
          const answer = row.answer || row.Answer;
          
          if (question && answer) {
            await createFlashcard({
              question,
              answer,
              deckId: createdDeck.id,
              difficulty: 'medium'
            });
            cardCount++;
            
            if (cardCount % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }

        setSuccess({
          deckName: createdDeck.name,
          cardCount: cardCount
        });
        
        setProcessingState({
          file: null,
          parsedData: null,
          deckName: null,
          step: 'complete'
        });
        
        setIsProcessing(false);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create flashcards');
        setIsProcessing(false);
        setIsDragging(false);
        setProcessingState({
          file: null,
          parsedData: null,
          deckName: null,
          step: 'idle'
        });
      }
    };
    
    createCards();
    
    const timeoutId = setTimeout(() => {
      if (processingState.step === 'creatingCards') {
        setError('Import is taking too long. Please try again with a smaller file.');
        setIsProcessing(false);
        setIsDragging(false);
        setProcessingState({
          file: null,
          parsedData: null,
          deckName: null,
          step: 'idle'
        });
      }
    }, 30000);
    
    return () => clearTimeout(timeoutId);
  }, [decks, processingState.step, processingState.deckName, processingState.parsedData, processingState.file, createFlashcard]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      parseFile(file);
    }
  }, [parseFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      parseFile(file);
    }
  }, [parseFile]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleReset = useCallback(() => {
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Helper functions
  const readFileAsync = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = (e) => {
        reject(new Error('Failed to read file'));
      };
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/csv' || file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const parseCSV = (csvText: string): Array<Record<string, string>> => {
    try {
      // Simple CSV parser - in a real app, use a robust CSV parsing library
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);
      });
    } catch (e) {
      console.error("CSV parsing error:", e);
      throw new Error("Failed to parse CSV data. Make sure your file is correctly formatted.");
    }
  };

  const parseExcel = (buffer: ArrayBuffer): Array<Record<string, string>> => {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (e) {
      console.error("Excel parsing error:", e);
      throw new Error("Failed to parse Excel data. Make sure your file is correctly formatted.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent backdrop with click handler to close */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"
        aria-hidden="true"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
          <motion.div 
            className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Import Flashcards
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">
                      {processingState.step === 'parsing' && 'Parsing your file...'}
                      {processingState.step === 'creatingDeck' && 'Creating deck...'}
                      {processingState.step === 'creatingCards' && 'Creating flashcards...'}
                    </p>
                  </motion.div>
                ) : processingState.step === 'namingDeck' ? (
                  <motion.div
                    key="namingDeck"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white p-4 rounded-md"
                  >
                    <div className="flex">
                      <div className="w-full">
                        <h4 className="text-sm font-medium text-gray-800 mb-4">Name Your Deck</h4>
                        <form onSubmit={handleDeckNameSubmit}>
                          <div className="mb-4">
                            <label htmlFor="deckName" className="block text-sm font-medium text-gray-700 mb-1">
                              Deck Name
                            </label>
                            <input
                              id="deckName"
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              value={customDeckName}
                              onChange={(e) => setCustomDeckName(e.target.value)}
                              placeholder={processingState.file ? `${processingState.file.name.split('.')[0]}` : 'Enter deck name'}
                              required
                              autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Your deck will contain {processingState.parsedData?.length || 0} flashcards
                            </p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProcessingState({
                                  file: null,
                                  parsedData: null,
                                  deckName: null,
                                  step: 'idle'
                                });
                                setIsProcessing(false);
                              }}
                              type="button"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              type="submit"
                            >
                              Create Deck
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 p-4 rounded-md"
                  >
                    <div className="flex">
                      <FiAlertCircle className="text-red-500 mr-3 flex-shrink-0" size={24} />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Import failed</h4>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <div className="mt-4">
                          <Button variant="outline" onClick={handleReset}>
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-50 p-4 rounded-md"
                  >
                    <div className="flex">
                      <FiCheckCircle className="text-green-500 mr-3 flex-shrink-0" size={24} />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Import successful!</h4>
                        <p className="mt-1 text-sm text-green-700">
                          Created deck "{success.deckName}" with {success.cardCount} flashcards.
                        </p>
                        <div className="mt-4 flex space-x-3">
                          <Button variant="primary" onClick={onClose}>
                            Done
                          </Button>
                          <Button variant="outline" onClick={handleReset}>
                            Import Another
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xls,.xlsx,.txt"
                      onChange={handleFileInputChange}
                    />
                    <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your CSV or Excel file here
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      File must contain "question" and "answer" columns
                    </p>
                    <div className="mt-4">
                      <button 
                        type="button"
                        onClick={handleButtonClick}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Select File
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ImportDropzone;