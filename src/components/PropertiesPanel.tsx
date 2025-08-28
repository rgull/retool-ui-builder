"use client";

import React, { useState } from "react";

interface PropertiesPanelProps {
  selectedComponent: any | null;
  onUpdate: (updatedComponent: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

const IMAGE_URL_REGEX = /^https?:\/\/[^\s]+$/i;

export default function PropertiesPanel({
  selectedComponent,
  onUpdate,
  isVisible,
  onClose,
}: PropertiesPanelProps) {
  const [imageError, setImageError] = useState("");

  if (!isVisible || !selectedComponent) {
    return null;
  }

  const handleContentChange = (content: string) => {
    console.log("PropertiesPanel: Updating content to:", content);
    onUpdate({
      ...selectedComponent,
      content,
    });
  };

  const handleWidthChange = (width: number) => {
    onUpdate({
      ...selectedComponent,
      width: Math.max(1, Math.min(12, width)),
    });
  };

  const handleImageUrlChange = (url: string) => {
    handleContentChange(url);
    if (!IMAGE_URL_REGEX.test(url) && url.trim() !== "") {
      setImageError("Please enter a valid image URL");
    } else {
      setImageError("");
    }
  };

  const renderTextProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Content (Markdown)
        </label>
        <textarea
          value={selectedComponent.content || ""}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
          placeholder="Enter markdown text here..."
        />
      </div>
    </div>
  );

  const renderImageProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Image URL
        </label>
        <input
          type="text"
          value={selectedComponent.content || ""}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          className={`w-full p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
            imageError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
          }`}
          placeholder="https://placehold.co/600x400/orange/white"
        />
        {imageError && (
          <p className="mt-1 text-sm text-red-500">{imageError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Preview
        </label>
        <div className="w-full h-32 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
          {selectedComponent.content ? (
            <img
              src={selectedComponent.content}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
              }}
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-xs">No image URL</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLayoutProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Layout
        </label>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Width (cols)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={selectedComponent.width || 6}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Close panel"
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
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {selectedComponent.type.charAt(0).toUpperCase() +
            selectedComponent.type.slice(1)}{" "}
          Component
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Component-specific properties */}
        {selectedComponent.type === "text" && renderTextProperties()}
        {selectedComponent.type === "image" && renderImageProperties()}

        {/* Layout properties */}
        {renderLayoutProperties()}
      </div>
    </div>
  );
}
