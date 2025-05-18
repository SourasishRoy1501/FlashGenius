'use client';

import React from 'react';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mr-2">
                  F
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 text-transparent bg-clip-text">
                  FlashGenius
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-md">
              FlashGenius is a spaced repetition flashcard app that helps you learn efficiently by showing you cards at the optimal time for memorization.
            </p>
            <div className="mt-4 flex space-x-4">
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiGithub size={18} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiTwitter size={18} />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiLinkedin size={18} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/decks" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  My Decks
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/import" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Import Cards
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FlashGenius. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2 sm:mt-0 flex items-center">
            Made with <FiHeart className="mx-1 text-red-500" /> for the hackathon
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 