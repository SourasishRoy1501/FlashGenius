'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiGrid
} from 'react-icons/fi';
import { useApp } from '@/lib/contexts/AppContext';
import { calculateRetentionRate } from '@/lib/utils';
import { ReviewSession, ReviewResult, Deck } from '@/lib/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { StatCard, Tab, TimeRangeButton, ChartContainer } from '@/components/features/analytics/AnalyticsComponents';
import { useRouter, usePathname } from 'next/navigation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const { decks, flashcards, reviewSessions } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const reviewSessionsCountRef = useRef(0);

  useEffect(() => {
    const totalReviewsCount = reviewSessions.reduce((acc, session) => acc + session.reviews.length, 0);

    if (totalReviewsCount !== reviewSessionsCountRef.current) {
      reviewSessionsCountRef.current = totalReviewsCount;
      setRefreshKey(Date.now());
    }
  }, [reviewSessions]);

  const [activeTab, setActiveTab] = useState<'overview' | 'decks'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [filteredSessions, setFilteredSessions] = useState<ReviewSession[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [difficultyData, setDifficultyData] = useState<any>(null);
  const [deckPerformanceData, setDeckPerformanceData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<ReviewSession[]>([]);
  const [deckStats, setDeckStats] = useState<Array<{
    deck: Deck;
    cardCount: number;
    reviewCount: number;
    accuracy: number;
    lastReviewed: string;
  }>>([]);

  const totalCards = flashcards.length;
  const totalDecks = decks.length;
  const totalReviews = reviewSessions.reduce((acc, session) => acc + session.reviews.length, 0);

  const correctAnswers = reviewSessions.reduce(
    (acc, session) => acc + session.reviews.filter(r => r.isCorrect).length,
    0
  );
  const retentionRate = calculateRetentionRate(correctAnswers, totalReviews);

  const calculateStreak = useCallback(() => {
    if (reviewSessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let currentDate = new Date(today);

    while (true) {
      const hasReviewOnDate = reviewSessions.some(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });

      if (hasReviewOnDate) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [reviewSessions]);

  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(calculateStreak());
  }, [calculateStreak, reviewSessions]);

  const getFilteredSessions = useCallback(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    return reviewSessions.filter(session =>
      new Date(session.startTime) >= startDate
    );
  }, [timeRange, reviewSessions]);

  useEffect(() => {
    setFilteredSessions(getFilteredSessions());
  }, [getFilteredSessions, reviewSessions, timeRange]);

  useEffect(() => {
    const sortedSessions = [...reviewSessions]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
    setRecentActivity(sortedSessions);
  }, [reviewSessions]);

  const generateProgressData = useCallback(() => {
    const now = new Date();
    let startDate: Date;
    let labels: string[] = [];
    let interval: 'day' | 'week' | 'month' = 'day';

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        labels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        interval = 'day';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        labels = Array.from({ length: 4 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i * 7);
          return `Week ${i + 1}`;
        });
        interval = 'week';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
        labels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + i);
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
        interval = 'month';
        break;
    }
      
    const reviewCounts = labels.map((_, index) => {
      let count = 0;

      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);

        if (interval === 'day') {
          const dayIndex = Math.floor((sessionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayIndex === index) {
            count += session.reviews.length;
          }
        } else if (interval === 'week') {
          const weekIndex = Math.floor((sessionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          if (weekIndex === index) {
            count += session.reviews.length;
          }
        } else if (interval === 'month') {
          const monthIndex = (sessionDate.getFullYear() - startDate.getFullYear()) * 12 +
            sessionDate.getMonth() - startDate.getMonth();
          if (monthIndex === index) {
            count += session.reviews.length;
          }
        }
      });

      return count;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cards Reviewed',
          data: reviewCounts,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3,
        }
      ]
    };
  }, [filteredSessions, timeRange]);

  const generateDifficultyData = useCallback(() => {
    const difficultyCounts = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    filteredSessions.forEach(session => { if (!session.reviews || !Array.isArray(session.reviews)) { return; } session.reviews.forEach((review: ReviewResult) => { if (!review || !review.difficulty) { return; } if (review.difficulty === 'easy') { difficultyCounts.easy++; } else if (review.difficulty === 'medium') { difficultyCounts.medium++; } else if (review.difficulty === 'hard') { difficultyCounts.hard++; } }); });

    return {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [
        {
          data: [difficultyCounts.easy, difficultyCounts.medium, difficultyCounts.hard],
          backgroundColor: [
            'rgba(34, 197, 94, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgb(22, 163, 74)',
            'rgb(147, 51, 234)',
            'rgb(220, 38, 38)'
          ],
          borderWidth: 1,
        }
      ]
    };
  }, [filteredSessions]);

  const generateDeckPerformanceData = useCallback(() => {
    const deckReviewCounts = decks.map(deck => {
      const deckReviews = filteredSessions
        .filter(session => session.deckId === deck.id)
        .reduce((acc, session) => acc + session.reviews.length, 0);

      return {
        id: deck.id,
        name: deck.name,
        reviewCount: deckReviews
      };
    }).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

    return {
      labels: deckReviewCounts.map(d => d.name),
      datasets: [
        {
          label: 'Reviews',
          data: deckReviewCounts.map(d => d.reviewCount),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1,
        }
      ]
    };
  }, [decks, filteredSessions]);

  useEffect(() => {
    setProgressData(generateProgressData());
    setDifficultyData(generateDifficultyData());
    setDeckPerformanceData(generateDeckPerformanceData());
  }, [generateProgressData, generateDifficultyData, generateDeckPerformanceData, filteredSessions]);

  useEffect(() => {
    const stats = decks.map(deck => {
      const deckCards = flashcards.filter(card => card.deckId === deck.id).length;
      const deckSessions = reviewSessions.filter(session => session.deckId === deck.id);
      const deckReviews = deckSessions.reduce((acc, session) => acc + session.reviews.length, 0);

      const correctAnswers = deckSessions.reduce(
        (acc, session) => acc + session.reviews.filter(r => r.isCorrect).length,
        0
      );

      const accuracy = calculateRetentionRate(correctAnswers, deckReviews);

      const lastReviewedSession = deckSessions.sort((a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )[0];

      const lastReviewed = lastReviewedSession
        ? new Date(lastReviewedSession.startTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        : 'Never';

      return {
        deck,
        cardCount: deckCards,
        reviewCount: deckReviews,
        accuracy,
        lastReviewed
      };
    });

    setDeckStats(stats);
  }, [decks, flashcards, reviewSessions]);

  useEffect(() => {
    const refreshData = () => {
      
      setFilteredSessions(getFilteredSessions());
      setProgressData(generateProgressData());
      setDifficultyData(generateDifficultyData());
      setDeckPerformanceData(generateDeckPerformanceData());

      const sortedSessions = [...reviewSessions]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);
      setRecentActivity(sortedSessions);

      const stats = decks.map(deck => {
        const deckCards = flashcards.filter(card => card.deckId === deck.id).length;
        const deckSessions = reviewSessions.filter(session => session.deckId === deck.id);
        const deckReviews = deckSessions.reduce((acc, session) => acc + session.reviews.length, 0);

        const correctAnswers = deckSessions.reduce(
          (acc, session) => acc + session.reviews.filter(r => r.isCorrect).length,
          0
        );

        const accuracy = calculateRetentionRate(correctAnswers, deckReviews);

        const lastReviewedSession = deckSessions.sort((a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )[0];

        const lastReviewed = lastReviewedSession
          ? new Date(lastReviewedSession.startTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          : 'Never';

        return {
          deck,
          cardCount: deckCards,
          reviewCount: deckReviews,
          accuracy,
          lastReviewed
        };
      });

      setDeckStats(stats);
      setStreak(calculateStreak());
    };

    refreshData();

    const intervalId = setInterval(refreshData, 2000); 
    return () => clearInterval(intervalId);
  }, [calculateStreak, decks, flashcards, generateDifficultyData, generateDeckPerformanceData, generateProgressData, getFilteredSessions, reviewSessions, refreshKey]);

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Review Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cards Reviewed'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Difficulty Distribution',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Decks by Reviews',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reviews'
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" key={refreshKey}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your learning progress and review statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Cards"
          value={totalCards}
          icon="cards"
          subtitle={`Across ${totalDecks} deck${totalDecks !== 1 ? 's' : ''}`}
        />

        <StatCard
          title="Reviews"
          value={totalReviews}
          icon="reviews"
          subtitle={`From ${reviewSessions.length} review session${reviewSessions.length !== 1 ? 's' : ''}`}
        />

        <StatCard
          title="Retention Rate"
          value={`${retentionRate}%`}
          icon="retention"
          subtitle={`${correctAnswers} correct out of ${totalReviews}`}
        />

        <StatCard
          title="Current Streak"
          value={streak}
          icon="streak"
          subtitle={streak > 0 ? "Keep up the good work!" : "Start reviewing today!"}
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Tab
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <Tab
            label="Decks"
            isActive={activeTab === 'decks'}
            onClick={() => setActiveTab('decks')}
          />
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Time Range Selector */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <TimeRangeButton
                label="Week"
                isActive={timeRange === 'week'}
                onClick={() => setTimeRange('week')}
                position="left"
              />
              <TimeRangeButton
                label="Month"
                isActive={timeRange === 'month'}
                onClick={() => setTimeRange('month')}
                position="middle"
              />
              <TimeRangeButton
                label="Year"
                isActive={timeRange === 'year'}
                onClick={() => setTimeRange('year')}
                position="right"
              />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer>
              <Line options={lineOptions} data={progressData || { labels: [], datasets: [] }} />
            </ChartContainer>
            <ChartContainer>
              <Pie options={pieOptions} data={difficultyData || { labels: [], datasets: [] }} />
            </ChartContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((session, index) => {
                  const deck = decks.find(d => d.id === session.deckId);
                  const sessionDate = new Date(session.startTime);
                  const correctCount = session.reviews.filter(r => r.isCorrect).length;
                  const accuracy = session.reviews.length > 0
                    ? Math.round((correctCount / session.reviews.length) * 100)
                    : 0;

                  return (
                    <div key={session.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className={`p-2 rounded-full ${accuracy >= 70 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {accuracy >= 70 ? (
                          <FiCheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <FiAlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">{deck?.name || 'Unknown Deck'}</h4>
                          <span className="text-sm text-gray-500">
                            {sessionDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Reviewed {session.reviews.length} cards with {accuracy}% accuracy
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No review sessions yet. Start reviewing your flashcards to see activity here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'decks' && (
        <div className="space-y-8">
          {/* Top Decks */}
          <ChartContainer>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Decks by Review Count</h3>
            <div className="h-64">
              <Bar options={barOptions} data={deckPerformanceData || { labels: [], datasets: [] }} />
            </div>
          </ChartContainer>

          {/* Deck List with Stats */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deck Performance</h3>
            {decks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deck Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cards
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviews
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Reviewed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deckStats.map((stat) => (
                      <tr key={stat.deck.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{stat.deck.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{stat.cardCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{stat.reviewCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${stat.accuracy >= 80 ? 'text-green-600' :
                              stat.accuracy >= 60 ? 'text-yellow-600' :
                                stat.accuracy > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                            {stat.accuracy > 0 ? `${stat.accuracy}%` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.lastReviewed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiGrid className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No decks found. Create your first deck to start tracking performance.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 