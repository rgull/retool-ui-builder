'use client';

import React from 'react';

interface ComponentPaletteProps {
  onAddComponent: (type: 'text' | 'image') => void;
  onCloseSidebar?: () => void;
}

const COMPONENTS = [
  {
    type: 'text' as const,
    name: 'Text Block',
    description: 'Add rich text content with markdown support',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-gray-700',
  },
  {
    type: 'image' as const,
    name: 'Image Block',
    description: 'Add images from URLs with responsive sizing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-gray-700',
  },
];

export default function ComponentPalette({ onAddComponent, onCloseSidebar }: ComponentPaletteProps) {
  const handleDragStart = (e: React.DragEvent, type: 'text' | 'image') => {
    e.dataTransfer.setData('componentType', type);
  };

  const handleClick = (type: 'text' | 'image') => {
    onAddComponent(type);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 p-4 space-y-3">
        {COMPONENTS.map((component) => (
          <div
            key={component.type}
            draggable
            onDragStart={(e) => handleDragStart(e, component.type)}
            onClick={() => handleClick(component.type)}
            className="group cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${component.color} text-white group-hover:scale-105 transition-transform`}>
                {component.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {component.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {component.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Pro Tip:</p>
          <p>Drag components to the workspace or click to add them automatically.</p>
        </div>
      </div>
    </div>
  );
}
