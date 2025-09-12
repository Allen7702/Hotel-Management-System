/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

interface CardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactElement<any>;  
}

export default function Card({ title, value, description, icon }: CardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-600 text-sm">{title}</h3>
        {React.cloneElement(icon, { className: `${icon.props.className || ''} w-8 h-8 primary-color`.trim() })}
      </div>
      <p className="text-2xl font-bold primary-color mt-2">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}