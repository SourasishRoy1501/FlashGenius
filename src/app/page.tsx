'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiBarChart2, FiClock, FiCloud, FiDownload, FiGrid, FiUsers } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function Home() {
  const features = [
    {
      icon: <FiGrid className="h-6 w-6 text-primary-600" />,
      title: "Deck Categorization",
      description: "Organize your flashcards into decks with categories, tags, and visual indicators for review status."
    },
    {
      icon: <FiBarChart2 className="h-6 w-6 text-primary-600" />,
      title: "Analytics Dashboard",
      description: "Track your learning with detailed analytics including heatmaps, retention rates, and progress over time."
    },
    {
      icon: <FiClock className="h-6 w-6 text-primary-600" />,
      title: "Smart Review Scheduler",
      description: "Our spaced repetition algorithm ensures you review cards at the optimal time for long-term retention."
    },
    {
      icon: <FiDownload className="h-6 w-6 text-primary-600" />,
      title: "Google Sheets Import",
      description: "Import flashcards directly from Google Sheets to quickly build your study decks."
    },
    {
      icon: <FiUsers className="h-6 w-6 text-primary-600" />,
      title: "Collaboration Mode",
      description: "Share decks with friends or colleagues and collaborate on creating the perfect study material."
    },
    {
      icon: <FiCloud className="h-6 w-6 text-primary-600" />,
      title: "Marketplace",
      description: "Discover and import high-quality flashcard decks created by the community."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 pt-20 pb-32">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent"></div>
          <div className="h-full w-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23000000" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  Welcome to FlashGenius
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight lg:leading-tight">
                  Master any subject with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">spaced repetition</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  FlashGenius helps you learn efficiently by showing you cards at just the right time. Create custom decks, import from Google Sheets, track your progress, and collaborate with others.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/decks">
                    <Button variant="primary" size="lg" icon={<FiArrowRight />}>
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button variant="outline" size="lg">
                      Explore Decks
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-w-5 aspect-h-3 bg-gray-200 w-full h-96 relative rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-md">
                        {/* Mock Flashcard UI */}
                        <div className="glassmorphism-card w-full h-80 rounded-xl shadow-xl p-8 text-center flex flex-col justify-between transform rotate-3 bg-white/80 backdrop-blur-md border border-white/20">
                          <div className="text-2xl font-bold text-gray-800">What is a closure in JavaScript?</div>
                          <div className="mt-auto text-lg text-gray-700">
                            <div className="p-4 bg-gray-50/70 backdrop-blur-sm rounded-lg">
                              A closure is a function that has access to its own scope, the scope of the outer function, and the global scope.
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-5 right-20 w-44 transform -rotate-6 bg-white/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-3">
                          <div className="text-xs font-semibold text-gray-700">Next review in 3 days</div>
                          <div className="flex justify-between mt-2">
                            <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Hard</button>
                            <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Medium</button>
                            <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Easy</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Features designed for optimal learning
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">
                FlashGenius combines powerful learning science with intuitive design to help you learn faster and remember longer.
              </p>
            </motion.div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative p-6 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-md bg-primary-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-accent-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How FlashGenius works
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">
                Our spaced repetition algorithm optimizes your learning experience by showing you cards at the perfect moment.
              </p>
            </motion.div>
          </div>

          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gradient-to-r from-accent-50 to-secondary-50 text-lg font-medium text-gray-900">
                  The Learning Journey
                </span>
              </div>
            </div>

            <div className="mt-8 max-w-3xl mx-auto">
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Create your decks",
                    description: "Build your flashcard decks from scratch or import from Google Sheets. Organize them by category."
                  },
                  {
                    step: 2,
                    title: "Start reviewing",
                    description: "Begin your learning session with a optimized set of cards selected by our algorithm."
                  },
                  {
                    step: 3,
                    title: "Rate your difficulty",
                    description: "After each card, rate how difficult it was to recall the answer: Easy, Medium, or Hard."
                  },
                  {
                    step: 4,
                    title: "Smart rescheduling",
                    description: "Cards you find difficult will appear more frequently, while easier ones will be shown at increasing intervals."
                  },
                  {
                    step: 5,
                    title: "Track your progress",
                    description: "Monitor your learning with detailed analytics showing your retention rate and improvement over time."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left md:max-w-2xl">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Ready to boost your learning?
              </h2>
              <p className="mt-3 text-lg text-primary-100">
                Join thousands of students who are already using FlashGenius to master their subjects.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <Link href="/decks">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<FiArrowRight />}
                >
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
