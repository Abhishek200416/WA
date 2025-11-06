import React, { useState } from 'react';

const ChatFilters = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'favourites', label: 'Favourites' },
    { id: 'groups', label: 'Groups' },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  return (
    <div className="px-4 py-3 bg-[#111B21] border-b border-[#2A3942]">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all active:scale-95 ${
              activeFilter === filter.id
                ? 'bg-[#00A884] text-white shadow-lg shadow-[#00A884]/30'
                : 'bg-[#202C33] text-[#8696A0] hover:bg-[#2A3942]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatFilters;
