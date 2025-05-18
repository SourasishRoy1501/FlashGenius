'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiAward, FiGrid } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: 'cards' | 'reviews' | 'retention' | 'streak';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle }) => {
  const getIconComponent = () => {
    switch (icon) {
      case 'cards':
        return <FiGrid className="text-primary-600 h-6 w-6" />;
      case 'reviews':
        return <FiBarChart2 className="text-accent-600 h-6 w-6" />;
      case 'retention':
        return <FiTrendingUp className="text-green-600 h-6 w-6" />;
      case 'streak':
        return <FiAward className="text-yellow-600 h-6 w-6" />;
    }
  };
  
  const getBgColor = () => {
    switch (icon) {
      case 'cards':
        return 'bg-primary-100';
      case 'reviews':
        return 'bg-accent-100';
      case 'retention':
        return 'bg-green-100';
      case 'streak':
        return 'bg-yellow-100';
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`${getBgColor()} p-3 rounded-lg`}>
          {getIconComponent()}
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 text-sm text-gray-500">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
};

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`pb-4 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

interface TimeRangeButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  position: 'left' | 'middle' | 'right';
}

export const TimeRangeButton: React.FC<TimeRangeButtonProps> = ({ 
  label, 
  isActive, 
  onClick, 
  position 
}) => {
  const getBorderRadius = () => {
    switch (position) {
      case 'left':
        return 'rounded-l-lg';
      case 'right':
        return 'rounded-r-lg';
      default:
        return '';
    }
  };
  
  const getBorder = () => {
    switch (position) {
      case 'left':
      case 'right':
        return 'border';
      case 'middle':
        return 'border-t border-b';
    }
  };
  
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium ${getBorderRadius()} ${
        isActive
          ? 'bg-primary-50 text-primary-700 border-primary-200'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      } ${getBorder()}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

interface ChartContainerProps {
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      {children}
    </div>
  );
}; 