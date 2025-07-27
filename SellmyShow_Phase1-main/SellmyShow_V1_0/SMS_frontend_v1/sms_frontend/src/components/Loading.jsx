import React from 'react';

function LoadingSpinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center p-8">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full border-4 border-gray-200 border-t-red-600 rounded-full"></div>
      </div>
    </div>
  );
}

function TicketCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="flex flex-col md:flex-row">
        {/* Image skeleton */}
        <div className="md:w-48 h-64 md:h-72 bg-gray-200 shimmer"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded shimmer w-3/4"></div>
            
            {/* Venue skeleton */}
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            
            {/* Date skeleton */}
            <div className="h-4 bg-gray-200 rounded shimmer w-2/3"></div>
            
            {/* Price skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded shimmer w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-1/4"></div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-12 bg-gray-200 rounded shimmer w-full mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title = "No tickets found", message = "Try adjusting your filters or check back later." }) {
  return (
    <div className="text-center py-16">
      <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
        <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{message}</p>
    </div>
  );
}

export { LoadingSpinner, TicketCardSkeleton, EmptyState };
