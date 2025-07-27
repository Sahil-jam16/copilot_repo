import React from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function FilterBar({ 
  cities, 
  movies, 
  filterCity, 
  setFilterCity, 
  filterMovie, 
  setFilterMovie, 
  sortBy, 
  setSortBy, 
  filterCount, 
  setFilterCount 
}) {
  const clearFilters = () => {
    setFilterCity('');
    setFilterMovie('');
    setSortBy('');
    setFilterCount('');
  };

  const hasActiveFilters = filterCity || filterMovie || sortBy || filterCount;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Tickets</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">City</label>
          <select
            onChange={(e) => setFilterCity(e.target.value)}
            value={filterCity}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white"
          >
            <option value="">All Cities</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Movie Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Movie/Event</label>
          <select
            onChange={(e) => setFilterMovie(e.target.value)}
            value={filterMovie}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white"
          >
            <option value="">All Movies</option>
            {movies.map((movie, index) => (
              <option key={index} value={movie}>{movie}</option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Sort By</label>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white"
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="date_asc">Date: Earliest First</option>
            <option value="date_desc">Date: Latest First</option>
          </select>
        </div>

        {/* Ticket Count Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Min Tickets</label>
          <div className="relative">
            <input
              type="number"
              placeholder="Min tickets"
              value={filterCount}
              onChange={(e) => setFilterCount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 pr-10"
              min="1"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filterCity && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                City: {filterCity}
                <button
                  onClick={() => setFilterCity('')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterMovie && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Movie: {filterMovie}
                <button
                  onClick={() => setFilterMovie('')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            {sortBy && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sort: {sortBy.replace('_', ' ').toUpperCase()}
                <button
                  onClick={() => setSortBy('')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterCount && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Min Tickets: {filterCount}
                <button
                  onClick={() => setFilterCount('')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
