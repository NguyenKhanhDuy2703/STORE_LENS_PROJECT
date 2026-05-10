import React from 'react';

export const CustomerCard = ({ children, className = "" }) => (
  <div className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);