'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiStar, FiPackage, FiCopy, FiUsers, FiEye, FiUser, FiLayers, FiArrowUp, FiArrowDown, FiCalendar } from 'react-icons/fi';
import { useApp } from '@/lib/contexts/AppContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { DeckViewModal } from '@/components/features/decks';
import { Deck } from '@/lib/types';

export default function MarketplacePage() {
  const { communityDecks, importDeck, user, incrementDeckViews, isForked } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDeck, setViewDeck] = useState<Deck | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [deckToFork, setDeckToFork] = useState<Deck | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    communityDecks.forEach(deck => {
      if (deck.category) {
        uniqueCategories.add(deck.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [communityDecks]);

  const authors = useMemo(() => {
    const uniqueAuthors = new Map<string, { id: string; name: string }>();
    communityDecks.forEach(deck => {
      if (deck.authorId && !uniqueAuthors.has(deck.authorId)) {
        uniqueAuthors.set(deck.authorId, {
          id: deck.authorId,
          name: deck.authorId === 'user-1' ? 'John Doe' : 
                deck.authorId === 'user-2' ? 'Jane Smith' :
                deck.authorId === 'user-3' ? 'Robert Johnson' :
                deck.authorId === 'user-4' ? 'Emily Chen' : 'Unknown User'
        });
      }
    });
    return Array.from(uniqueAuthors.values());
  }, [communityDecks]);

  const filteredDecks = useMemo(() => {
    return communityDecks
      .filter(deck => 
        deck.isPublic &&
        (deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deck.category && deck.category.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (categoryFilter ? deck.category === categoryFilter : true)
      )
      .sort((a, b) => {
        let valueA, valueB;
        
        if (sortBy === 'name') {
          valueA = a.name;
          valueB = b.name;
        } else if (sortBy === 'cardsCount') {
          valueA = a.cardsCount;
          valueB = b.cardsCount;
        } else if (sortBy === 'createdAt') {
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
        } else if (sortBy === 'rating') {
          valueA = a.rating || 0;
          valueB = b.rating || 0;
        } else {
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
        }
        
        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
  }, [communityDecks, searchQuery, categoryFilter, sortBy, sortOrder]);
  
  const paginatedDecks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDecks.slice(startIndex, endIndex);
  }, [filteredDecks, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredDecks.length / itemsPerPage);
  
  const handleViewDeck = (deck: Deck) => {
    setViewDeck(deck);
    setIsViewModalOpen(true);
    incrementDeckViews(deck.id);
  };
  
  const handleShowForkConfirmation = (deck: Deck) => {
    setDeckToFork(deck);
    setIsForkModalOpen(true);
  };

  const handleForkDeck = () => {
    if (!deckToFork) return;
    
    const forkedDeck: Deck = {
      ...deckToFork,
      id: `fork-${deckToFork.id}`,
      name: `Fork of ${deckToFork.name}`,
      isPublic: false,
      authorId: user?.id,
    };
    
    importDeck(forkedDeck);
    setIsForkModalOpen(false);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setSortBy('rating');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deck Marketplace</h1>
            <p className="mt-1 text-gray-600">Discover and fork flashcard decks from the community</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Search marketplace decks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                icon={<FiFilter />}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={isFilterOpen ? 'bg-primary-50 text-primary-700 border-primary-300' : ''}
              >
                Filter
              </Button>
            </div>
          </div>
          
          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label htmlFor="categoryFilter" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiPackage className="mr-2 text-primary-600" /> 
                      Category
                    </label>
                    <select
                      id="categoryFilter"
                      className="w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label htmlFor="sortBy" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="mr-2 text-primary-600" />
                      Sort By
                    </label>
                    <select
                      id="sortBy"
                      className="w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="rating">Rating</option>
                      <option value="updatedAt">Last Updated</option>
                      <option value="createdAt">Date Created</option>
                      <option value="name">Name</option>
                      <option value="cardsCount">Card Count</option>
                    </select>
                  </div>
                  
                  {/* Sort Order */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label htmlFor="sortOrder" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      {sortOrder === 'asc' ? 
                        <FiArrowUp className="mr-2 text-primary-600" /> :
                        <FiArrowDown className="mr-2 text-primary-600" />
                      }
                      Sort Order
                    </label>
                    <select
                      id="sortOrder"
                      className="w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {paginatedDecks.length} of {filteredDecks.length} community decks
          {categoryFilter && ` in ${categoryFilter}`}
        </div>

        {/* Decks Display */}
        {filteredDecks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUsers className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No community decks found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || categoryFilter
                ? 'No decks match your filter criteria'
                : 'There are no public decks available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {paginatedDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card isHoverable className="h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            {deck.category && (
                              <span className="badge badge-primary">{deck.category}</span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mt-2">{deck.name}</h3>
                        </div>
                      </div>

                      {deck.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{deck.description}</p>
                      )}

                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <FiUser className="mr-1" />
                        <span>by {authors.find(a => a.id === deck.authorId)?.name || 'Unknown User'}</span>
                      </div>

                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={i < Math.floor(deck.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-600">{deck.rating?.toFixed(1)}</span>
                        
                        {/* Show forked indicator if user has forked this deck */}
                        {isForked(deck.id) && (
                          <span className="ml-3 badge badge-success flex items-center" title="You've forked this deck">
                            <FiCopy className="mr-1" /> Forked
                          </span>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiLayers className="mr-1" />
                            <span>{deck.cardsCount} cards</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiEye className="mr-1" />
                            <span>{deck.viewCount || 0} views</span>
                          </div>
                        </div>

                        <div className="mt-5 flex space-x-3">
                          <Button 
                            variant="primary" 
                            fullWidth
                            onClick={() => handleViewDeck(deck)}
                          >
                            Preview
                          </Button>
                          <Button 
                            variant="outline" 
                            fullWidth
                            icon={<FiCopy />}
                            onClick={() => handleShowForkConfirmation(deck)}
                          >
                            Fork
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Pagination */}
        {filteredDecks.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? 'bg-primary-50 text-primary-700 border border-primary-300'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* View Deck Modal */}
      {viewDeck && (
        <DeckViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          deck={viewDeck}
        />
      )}

      {/* Fork Confirmation Modal */}
      {deckToFork && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${!isForkModalOpen && 'hidden'}`}
          aria-hidden={!isForkModalOpen}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fork This Deck?</h3>
            <p className="text-gray-600 mb-6">
              A copy of <span className="font-semibold">{deckToFork.name}</span> will be added to your collection. 
              You'll be able to edit and customize it however you want.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => setIsForkModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                icon={<FiCopy />}
                onClick={handleForkDeck}
              >
                Fork Deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 