'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { AppProvider } from '@/lib/contexts/AppContext';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <motion.main 
          className="flex-grow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default MainLayout; 