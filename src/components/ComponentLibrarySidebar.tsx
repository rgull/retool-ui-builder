"use client";

import React from "react";

interface ComponentLibrarySidebarProps {
  // Callback when a component is added (drag or click)
  onAddComponent: (type: any) => void;
  // Optional callback to close sidebar
  onCloseSidebar?: () => void;
}

// Available components in the library
const COMPONENTS = [
  {
    type: "text" as const,
    name: "Text Component",
    description: "Add text content with markdown support",
    icon: (
      // Text component icon
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    color: "bg-gray-700",
  },
  {
    type: "image" as const,
    name: "Image Component",
    description: "Add images from URLs with responsive sizing",
    icon: (
      // Image component icon
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "bg-gray-700",
  },
];

export default function ComponentLibrarySidebar({
  onAddComponent,
  onCloseSidebar,
}: ComponentLibrarySidebarProps) {
  // Handles drag start puts component type into `dataTransfer`
  const handleDragStart = (e: React.DragEvent, type: any) => {
    e.dataTransfer.setData("componentType", type);
  };

  // Handles click instantly adds component
  const handleClick = (type: any) => {
    onAddComponent(type);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Components</h2>
        {/* Close button (only shown if prop passed) */}
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1 text-gray-400 rounded-lg"
            title="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Component list */}
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
              {/* Icon container */}
              <div
                className={`p-2 rounded-lg ${component.color} text-white group-hover:scale-105 transition-transform`}
              >
                {component.icon}
              </div>
              {/* Text info */}
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
    </div>
  );
}
