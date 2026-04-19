import React from 'react';

export const LoadingText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={`inline-flex items-center gap-2 ${className || ''}`}>
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
    {children}
  </span>
);
