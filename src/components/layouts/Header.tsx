'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiBook, FiBarChart2, FiUsers, FiUser } from 'react-icons/fi';
import { useApp } from '@/lib/contexts/AppContext';

const Header: React.FC = () => {
  const { user } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <motion.div 
                className="flex items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold mr-2">
                  F
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 text-transparent bg-clip-text">
                  FlashGenius
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" icon={<FiHome />} text="Home" />
            <NavLink href="/decks" icon={<FiBook />} text="My Decks" />
            <NavLink href="/analytics" icon={<FiBarChart2 />} text="Analytics" />
            <NavLink href="/marketplace" icon={<FiUsers />} text="Marketplace" />
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                  <FiUser />
                </div>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <MobileNavLink href="/" icon={<FiHome />} text="Home" onClick={toggleMenu} />
              <MobileNavLink href="/decks" icon={<FiBook />} text="My Decks" onClick={toggleMenu} />
              <MobileNavLink href="/analytics" icon={<FiBarChart2 />} text="Analytics" onClick={toggleMenu} />
              <MobileNavLink href="/marketplace" icon={<FiUsers />} text="Marketplace" onClick={toggleMenu} />
              
              {/* User Profile for Mobile */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                {user ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      <FiUser />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                ) : (
                  <Link href="/login" onClick={toggleMenu}>
                    <div className="w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Sign In
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, text }) => (
  <Link href={href} className="cursor-pointer">
    <motion.div
      className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200 relative group"
      whileHover={{ y: -2 }}
    >
      <span>{icon}</span>
      <span className="font-medium">{text}</span>
      <motion.div
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  </Link>
);

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, icon, text, onClick }) => (
  <Link href={href} onClick={onClick} className="block">
    <div className="flex items-center py-2 px-3 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary-600">
      <span className="mr-3 text-gray-500">{icon}</span>
      <span>{text}</span>
    </div>
  </Link>
);

export default Header; 