import React from 'react';
import type { RoomStatus } from '../types/room';

const statusColors: Record<RoomStatus, { bg: string; text: string }> = {
  'needs-cleaning': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'cleaned': { bg: 'bg-green-100', text: 'text-green-800' },
  'vacated': { bg: 'bg-red-100', text: 'text-red-800' },
  'occupied': { bg: 'bg-blue-100', text: 'text-blue-800' },
};

interface StatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = statusColors[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}