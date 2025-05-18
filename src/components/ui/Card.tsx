'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isHoverable?: boolean;
  isFlippable?: boolean;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  isHoverable = false,
  isFlippable = false,
  frontContent,
  backContent,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Base classes
  const baseClasses = 'rounded-xl bg-white p-6 shadow-card';
  const hoverClasses = isHoverable ? 'hover:shadow-card-hover transform hover:-translate-y-1 transition-all duration-300' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  // Combined classes
  const combinedClasses = `${baseClasses} ${hoverClasses} ${clickClasses} ${className}`;

  const handleClick = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) {
      onClick();
    }
  };

  if (isFlippable) {
    return (
      <div className="perspective-1000 w-full h-full relative" onClick={handleClick}>
        <motion.div
          className={`${combinedClasses} w-full h-full relative backface-hidden`}
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front Side */}
          <div
            className={`absolute w-full h-full top-0 left-0 p-6 ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-100 flex flex-col justify-between`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {frontContent || children}
          </div>

          {/* Back Side */}
          <div
            className={`absolute w-full h-full top-0 left-0 p-6 ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-100 flex flex-col justify-between`}
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
            {backContent}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className={combinedClasses}
      onClick={onClick}
      whileHover={isHoverable ? { y: -8, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card; 