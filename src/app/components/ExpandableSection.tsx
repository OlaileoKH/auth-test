'use client'; // Mark this as a Client Component

import { useState } from 'react';

export default function ExpandableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <div
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={toggleExpand}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-blue-600">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}