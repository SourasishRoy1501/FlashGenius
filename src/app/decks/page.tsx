'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiGrid, FiEdit, FiTrash2, FiMoreVertical, FiTag, FiLock, FiGlobe, FiCheck, FiAlertCircle, FiUploadCloud, FiChevronLeft, FiChevronRight, FiClock, FiBookmark, FiArrowUp, FiArrowDown, FiCalendar, FiLayers, FiPackage, FiCopy } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useApp } from '@/lib/contexts/AppContext';
import { formatDate } from '@/lib/utils';
import { CreateDeckModal, ImportDropzone, UserDeckViewModal } from '@/components/features/decks';
import { Deck } from '@/lib/types';

export default function DecksPage() {
  const { decks, updateDeck, deleteDeck, publishDeck } = useApp();
  const [view, setView] = useState<'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewDeck, setViewDeck] = useState<Deck | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuDeckId, setOpenMenuDeckId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    decks.forEach(deck => {
      if (deck.category) {
        uniqueCategories.add(deck.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [decks]);

  const filteredDecks = useMemo(() => {
    return decks
      .filter(deck => 
        // Search query filter
        (deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deck.category && deck.category.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        // Category filter
        (categoryFilter ? deck.category === categoryFilter : true) &&
        // Status filter
        (statusFilter ? deck.reviewStatus === statusFilter : true)
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
  }, [decks, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);
  
  const paginatedDecks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDecks.slice(startIndex, endIndex);
  }, [filteredDecks, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredDecks.length / itemsPerPage);
  
  const handleViewDeck = (deck: Deck) => {
    setViewDeck(deck);
    setIsViewModalOpen(true);
  };
  
  const handleTogglePrivacy = (deck: Deck) => {
    if (deck.isPublic) {
      updateDeck(deck.id, { isPublic: false });
    } else {
      // When making public, also add to marketplace
      updateDeck(deck.id, { isPublic: true });
      publishDeck(deck.id);
    }
  };

  const toggleMenu = (deckId: string) => {
    setOpenMenuDeckId(openMenuDeckId === deckId ? null : deckId);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Decks</h1>
            <p className="mt-1 text-gray-600">Manage your flashcard decks and track your progress</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              icon={<FiUploadCloud />} 
              onClick={() => setIsImportModalOpen(true)}
            >
              Import
            </Button>
            <Button 
              variant="primary" 
              icon={<FiPlus />} 
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Deck
            </Button>
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
                placeholder="Search decks..."
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
          
          {/* Filter Panel with Enhanced UI */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  
                  {/* Status Filter */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label htmlFor="statusFilter" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiLayers className="mr-2 text-primary-600" />
                      Review Status
                    </label>
                    <select
                      id="statusFilter"
                      className="w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="incomplete">Incomplete</option>
                      <option value="complete">Complete</option>
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
          Showing {paginatedDecks.length} of {filteredDecks.length} decks
          {(categoryFilter || statusFilter || searchQuery) && ' (filtered)'}
        </div>

        {/* Decks Display */}
        {filteredDecks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBookmark className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No decks found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || categoryFilter || statusFilter
                ? 'No decks match your filter criteria'
                : 'You have not created any decks yet'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="primary" 
                icon={<FiPlus />} 
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create your first deck
              </Button>
              <Button 
                variant="outline" 
                icon={<FiUploadCloud />} 
                onClick={() => setIsImportModalOpen(true)}
              >
                Import from file
              </Button>
            </div>
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
                            <button 
                              className="badge badge-secondary flex items-center"
                              onClick={() => handleTogglePrivacy(deck)}
                              title={deck.isPublic ? "Make Private" : "Make Public"}
                            >
                              {deck.isPublic ? (
                                <><FiGlobe className="mr-1" /> Public</>
                              ) : (
                                <><FiLock className="mr-1" /> Private</>
                              )}
                            </button>
                            {/* Forked indicator */}
                            {deck.id.startsWith('fork-') && (
                              <span className="badge badge-success flex items-center" title="Forked from marketplace">
                                <FiCopy className="mr-1" /> Forked
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mt-2">{deck.name}</h3>
                        </div>
                        <div className="relative">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={() => toggleMenu(deck.id)}
                          >
                            <FiMoreVertical className="text-gray-500" />
                          </button>
                          {openMenuDeckId === deck.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <Link href={`/decks/${deck.id}/edit`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <FiEdit className="mr-2" /> Edit Deck
                                </Link>
                                <button 
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => deleteDeck(deck.id)}
                                >
                                  <FiTrash2 className="mr-2" /> Delete Deck
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {deck.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{deck.description}</p>
                      )}

                      <div className="mt-auto">
                        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="mr-1" />
                            <span>Updated {formatDate(deck.updatedAt)}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {deck.cardsCount} cards
                          </div>
                        </div>

                        <div className="mt-5 flex space-x-3">
                          <Button 
                            variant="primary" 
                            fullWidth
                            onClick={() => handleViewDeck(deck)}
                          >
                            View Deck
                          </Button>
                          <Link href={`/decks/${deck.id}/review`} className="flex-1">
                            <Button variant="outline" fullWidth>
                              Review
                            </Button>
                          </Link>
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
                icon={<FiChevronLeft />}
              />
              
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
                icon={<FiChevronRight />}
              />
            </nav>
          </div>
        )}
      </div>

      {/* Create Deck Modal */}
      <CreateDeckModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {/* Import Modal */}
      <ImportDropzone
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      
      {/* View Deck Modal */}
      {viewDeck && (
        <UserDeckViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          deck={viewDeck}
        />
      )}
    </div>
  );
} 