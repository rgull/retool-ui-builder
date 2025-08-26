'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ComponentType, TextComponent, ImageComponent } from '@/types';
import Canvas from '@/components/Canvas';
import ComponentPalette from '@/components/ComponentPalette';
import ConfirmationModal from '@/components/ConfirmationModal';

const LOCAL_STORAGE_KEYS = {
  COMPONENTS: 'visual-builder-components',
  HISTORY: 'visual-builder-history',
  HISTORY_INDEX: 'visual-builder-history-index',
  SHOW_PREVIEW: 'visual-builder-show-preview',
  IS_EDITING: 'visual-builder-is-editing',
  SHOW_SIDEBAR: 'visual-builder-show-sidebar',
} as const;

export default function VisualBuilder() {
  const [components, setComponents] = useState<ComponentType[]>([]);
  const [history, setHistory] = useState<ComponentType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const savedComponents = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPONENTS);
    const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY);
    const savedHistoryIndex = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY_INDEX);
    const savedShowPreview = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_PREVIEW);
    const savedIsEditing = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_EDITING);
    const savedShowSidebar = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_SIDEBAR);

    if (savedComponents) {
      const parsedComponents = JSON.parse(savedComponents);
      setComponents(parsedComponents);
    }

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setHistory(parsedHistory);
    }

    if (savedHistoryIndex) {
      setHistoryIndex(parseInt(savedHistoryIndex));
    }

    if (savedShowPreview) {
      setShowPreview(JSON.parse(savedShowPreview));
    }

    if (savedIsEditing) {
      setIsEditing(JSON.parse(savedIsEditing));
    }

    if (savedShowSidebar) {
      setShowSidebar(JSON.parse(savedShowSidebar));
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient && isMobile) {
      setShowPreview(true);
      setIsEditing(false);
    }
  }, [isClient, isMobile]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
    }
  }, [components, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  }, [history, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY_INDEX, historyIndex.toString());
    }
  }, [historyIndex, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_PREVIEW, JSON.stringify(showPreview));
    }
  }, [showPreview, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.IS_EDITING, JSON.stringify(isEditing));
    }
  }, [isEditing, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_SIDEBAR, JSON.stringify(showSidebar));
    }
  }, [showSidebar, isClient]);

  const calculateNextPosition = useCallback((): { x: number; y: number } => {
    if (components.length === 0) {
      return { x: 0, y: 0 };
    }

    const lastComponent = components[components.length - 1];
    const nextX = lastComponent.position.x + lastComponent.width;

    if (nextX + 6 <= 12) {
      return { x: nextX, y: lastComponent.position.y };
    } else {
      return { x: 0, y: lastComponent.position.y + 1 };
    }
  }, [components]);

  const createComponent = useCallback(
    (type: "text" | "image"): ComponentType => {
      const position = calculateNextPosition();

      if (type === "text") {
        return {
          id: `text-${Date.now()}`,
          type: "text",
          content:
            "# New Text Component\n\nEnter your markdown content here...\n\n- **Bold text**\n- *Italic text*\n- `Code snippets`",
          width: 6,
          position,
        } as TextComponent;
      } else {
        return {
          id: `image-${Date.now()}`,
          type: "image",
          content: "https://placehold.co/600x400",
          width: 6,
          position,
        } as ImageComponent;
      }
    },
    [calculateNextPosition]
  );

  const addComponent = useCallback(
    (type: "text" | "image") => {
      const newComponent = createComponent(type);
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components, createComponent]
  );

  const updateComponent = useCallback(
    (updatedComponent: ComponentType) => {
      const newComponents = components.map((c) =>
        c.id === updatedComponent.id ? updatedComponent : c
      );
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components]
  );

  const updateComponentResize = useCallback(
    (updatedComponent: ComponentType) => {
      const newComponents = components.map((c) =>
        c.id === updatedComponent.id ? updatedComponent : c
      );
      setComponents(newComponents);
      debouncedAddToHistory(newComponents);
    },
    [components]
  );

  const deleteComponent = useCallback(
    (id: string) => {
      const newComponents = components.filter((c) => c.id !== id);
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components]
  );

  const addSampleData = useCallback(() => {
    const sampleComponents: ComponentType[] = [
      {
        id: "sample-text-1",
        type: "text",
        content:
          "# Welcome to Visual Builder\n\nThis is a **professional visual builder** that allows you to create layouts with text and image components.\n\n## Features\n- ✅ Text components with markdown support\n- ✅ Image components from URLs\n- ✅ 12-grid system for responsive layouts\n- ✅ Live preview mode\n- ✅ Component resizing\n- ✅ Undo/Redo functionality",
        width: 12,
        position: { x: 0, y: 0 },
      } as TextComponent,
      {
        id: "sample-image-1",
        type: "image",
        content: "https://placehold.co/800x400/4F46E5/FFFFFF?text=Sample+Image",
        width: 6,
        position: { x: 0, y: 1 },
      } as ImageComponent,
      {
        id: "sample-text-2",
        type: "text",
        content:
          "## Getting Started\n\n1. Click on components in the palette to add them\n2. Edit content in the text areas\n3. Resize components using the handles\n4. Toggle between edit and preview modes\n5. Use the preview button to see side-by-side comparison\n6. Use **Ctrl+Z** to undo and **Ctrl+Y** to redo",
        width: 6,
        position: { x: 6, y: 1 },
      } as TextComponent,
    ];
    setComponents(sampleComponents);
    setHistory([sampleComponents]);
    setHistoryIndex(0);
  }, []);

  const clearComponents = useCallback(() => {
    setComponents([]);
    setHistory([]);
    setHistoryIndex(-1);
    setShowClearModal(false);
  }, []);

  const addToHistory = useCallback(
    (newComponents: ComponentType[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newComponents);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const debouncedAddToHistory = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newComponents: ComponentType[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          addToHistory(newComponents);
        }, 300);
      };
    })(),
    [addToHistory]
  );

  const reorderComponents = useCallback(
    (reorderedComponents: ComponentType[]) => {
      setComponents(reorderedComponents);
      addToHistory(reorderedComponents);
    },
    [addToHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleClearClick = useCallback(() => {
    setShowClearModal(true);
  }, []);

  const handleClearConfirm = useCallback(() => {
    clearComponents();
  }, [clearComponents]);

  const handleClearCancel = useCallback(() => {
    setShowClearModal(false);
  }, []);

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Visual Builder
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Professional Layout Builder
              </p>
            </div>
          </div>

          {/* Mobile Preview Indicator */}
          {isMobile && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-medium">Preview Mode</span>
            </div>
          )}

          {/* Desktop Controls */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowPreview(false);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isEditing && !showPreview
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setShowPreview(true);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    !isEditing && showPreview
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Action Buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={addSampleData}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Sample
                </button>
                <button
                  onClick={handleClearClick}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Clear Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const renderSidebar = () => (
    <div className="w-full sm:w-80 bg-white border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col shadow-sm relative">
      <div className="flex-1 overflow-y-auto bg-white max-h-64 sm:max-h-none">
        <ComponentPalette
          onAddComponent={addComponent}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>
    </div>
  );

  const renderFloatingPlusButton = () => (
    <div className="fixed left-0 top-16 bottom-0 z-50 w-10 bg-white border-r border-gray-200 shadow-lg">
      <button
        onClick={() => setShowSidebar(true)}
        className="w-full h-16 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:from-slate-100 hover:to-slate-50 transition-all duration-200 group"
        title="Show sidebar"
      >
        <div className="w-7 h-7 bg-slate-100 group-hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </button>
    </div>
  );

  const renderMainContent = () => (
    <div className="flex-1">
      <Canvas
        components={components}
        onUpdateComponent={updateComponent}
        onUpdateComponentResize={updateComponentResize}
        onDeleteComponent={deleteComponent}
        onAddComponent={addComponent}
        onReorderComponents={reorderComponents}
        isEditing={!showPreview}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {renderHeader()}

      <main className="flex flex-col sm:flex-row h-[calc(100vh-80px)]">
        {isEditing && !isMobile && showSidebar && renderSidebar()}
        <div
          className={`flex-1 flex flex-col ${
            isEditing && !isMobile && !showSidebar ? "ml-12" : ""
          }`}
        >
          {renderMainContent()}
        </div>
      </main>

      {/* Floating plus button when sidebar is hidden */}
      {isEditing && !isMobile && !showSidebar && renderFloatingPlusButton()}

      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear All Components"
        message="Are you sure you want to clear all components? This action cannot be undone and will remove all your work."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={handleClearCancel}
      />
    </div>
  );
}
