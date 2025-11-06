import React from 'react';
import { MessageCircle } from 'lucide-react';

const WALogo = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-[#25D366] rounded-full flex items-center justify-center`}>
        <MessageCircle className="text-white" size={size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 36 : 48} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-semibold text-[#111B21]`}>WA</span>
        </div>
      )}
    </div>
  );
};

export default WALogo;
