"use client";

import React, { useState, useEffect, useCallback } from "react";
import DragAndDropArea from "@/components/DragAndDropArea";
import ComponentLibrarySidebar from "@/components/ComponentLibrarySidebar";
import ConfirmationModal from "@/components/ConfirmationModal";

// Constants for localStorage keys to avoid typos and improve maintainability
const LOCAL_STORAGE_KEYS = {
  COMPONENTS: "visual-builder-components",
  HISTORY: "visual-builder-history",
  HISTORY_INDEX: "visual-builder-history-index",
  SHOW_PREVIEW: "visual-builder-show-preview",
  IS_EDITING: "visual-builder-is-editing",
  SHOW_SIDEBAR: "visual-builder-show-sidebar",
} as const;

// Mobile breakpoint constant
const MOBILE_BREAKPOINT = 768;

//ShortcutKey constants
const KEY_UNDO = "z";
const KEY_REDO = "y";

export default function VisualBuilder() {
  // Core state management
  const [components, setComponents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI state management
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /*
    Initialize mobile detection and set up resize listener
    Also handles initial data loading from localStorage
   */
  useEffect(() => {
    // Mobile detection
    const checkMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;
    setIsMobile(checkMobile());

    // Mobile-specific UI adjustments
    if (checkMobile()) {
      setShowPreview(true);
      setIsEditing(false);
    }

    // Load saved state from localStorage
    const loadSavedState = () => {
      try {
        // Load components
        const savedComponents = localStorage.getItem(
          LOCAL_STORAGE_KEYS.COMPONENTS
        );
        if (savedComponents) {
          setComponents(JSON.parse(savedComponents));
        }

        // Load history
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }

        // Load history index
        const savedHistoryIndex = localStorage.getItem(
          LOCAL_STORAGE_KEYS.HISTORY_INDEX
        );
        if (savedHistoryIndex) {
          setHistoryIndex(parseInt(savedHistoryIndex, 10));
        }

        // Load UI preferences
        const savedShowPreview = localStorage.getItem(
          LOCAL_STORAGE_KEYS.SHOW_PREVIEW
        );
        if (savedShowPreview) {
          setShowPreview(JSON.parse(savedShowPreview));
        }

        const savedIsEditing = localStorage.getItem(
          LOCAL_STORAGE_KEYS.IS_EDITING
        );
        if (savedIsEditing) {
          setIsEditing(JSON.parse(savedIsEditing));
        }

        const savedShowSidebar = localStorage.getItem(
          LOCAL_STORAGE_KEYS.SHOW_SIDEBAR
        );
        if (savedShowSidebar) {
          setShowSidebar(JSON.parse(savedShowSidebar));
        }
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    };

    loadSavedState();

    // Set up resize listener for mobile detection
    const handleResize = () => {
      const mobile = checkMobile();
      setIsMobile(mobile);

      // Auto-adjust UI for mobile
      if (mobile) {
        setShowPreview(true);
        setIsEditing(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*
    Consolidated localStorage persistence effect
    Saves all state changes to localStorage when they occur
   */
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.COMPONENTS,
          JSON.stringify(components)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.HISTORY,
          JSON.stringify(history)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.HISTORY_INDEX,
          historyIndex.toString()
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SHOW_PREVIEW,
          JSON.stringify(showPreview)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.IS_EDITING,
          JSON.stringify(isEditing)
        );
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SHOW_SIDEBAR,
          JSON.stringify(showSidebar)
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    };

    saveToLocalStorage();
  }, [components, history, historyIndex, showPreview, isEditing, showSidebar]);

  /*
    Calculate optimal position for new components based on grid layout
    Uses a 12-column grid system with automatic row wrapping
   */
  const calculateNextPosition = useCallback((): { x: number; y: number } => {
    if (components.length === 0) {
      return { x: 0, y: 0 };
    }

    const lastComponent = components[components.length - 1];
    const nextX = lastComponent.position.x + lastComponent.width;

    // Check if component fits in current row (12-column grid)
    if (nextX + 6 <= 12) {
      // Default width is 6 columns
      return { x: nextX, y: lastComponent.position.y };
    } else {
      // Move to next row
      return { x: 0, y: lastComponent.position.y + 1 };
    }
  }, [components]);

  // Add current state to history for undo/redo functionality

  const addToHistory = useCallback(
    (newComponents: any[]) => {
      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newComponents);

      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex]
  );

  // Undo the last action

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo the last undone action

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComponents(history[newIndex]);
    }
  }, [history, historyIndex]);

  //Set up keyboard shortcuts for undo/redo functionality

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === KEY_UNDO && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === KEY_REDO || (e.key === KEY_UNDO && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Factory function to create new components with default values

  const createComponent = useCallback(
    (type: any) => {
      const position = calculateNextPosition();
      const timestamp = Date.now();

      if (type === "text") {
        return {
          id: `text-${timestamp}`,
          type: "text",
          content: "",
          width: 6,
          position,
        };
      } else {
        return {
          id: `image-${timestamp}`,
          type: "image",
          content: "https://placehold.co/600x400/orange/white",
          width: 6,
          position,
        };
      }
    },
    [calculateNextPosition]
  );

  /*
    Debounced version of addToHistory for resize operations
    Prevents too many history entries during continuous resize operations
   */
  const debouncedAddToHistory = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newComponents: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          addToHistory(newComponents);
        }, 300);
      };
    })(),
    [addToHistory]
  );

  /*
    Add a new component to the canvas and update history
   */
  const addComponent = useCallback(
    (type: any) => {
      const newComponent = createComponent(type);
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components, createComponent, addToHistory]
  );

  /*
    Update an existing component and add to history
    Used for content changes and position updates
   */
  const updateComponent = useCallback(
    (updatedComponent: any) => {
      const newComponents = components.map((c) =>
        c.id === updatedComponent.id ? updatedComponent : c
      );
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components, addToHistory]
  );

  /*
   Update component with debounced history addition
    Used specifically for resize operations to avoid too many history entries
   */
  const updateComponentResize = useCallback(
    (updatedComponent: any) => {
      const newComponents = components.map((c) =>
        c.id === updatedComponent.id ? updatedComponent : c
      );
      setComponents(newComponents);
      debouncedAddToHistory(newComponents);
    },
    [components, debouncedAddToHistory]
  );

  // Remove a component from the canvas

  const deleteComponent = useCallback(
    (id: string) => {
      const newComponents = components.filter((c) => c.id !== id);
      setComponents(newComponents);
      addToHistory(newComponents);
    },
    [components, addToHistory]
  );

  // Reorder components (used for drag-and-drop functionality)
  const reorderComponents = useCallback(
    (reorderedComponents: any[]) => {
      setComponents(reorderedComponents);
      addToHistory(reorderedComponents);
    },
    [addToHistory]
  );

  // Clear all components and reset the application state
  const clearComponents = () => {
    setComponents([]);
    setHistory([]);
    setHistoryIndex(-1);
    setShowClearModal(false);
  };

  // Render the application header with logo, controls, and mode toggles
  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Retool UI Builder
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Drag and Drop to build Layout
              </p>
            </div>
          </div>

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
                  onClick={() => setShowClearModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
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

  // Render the component library sidebar
  const renderSidebar = () => (
    <div className="w-full sm:w-80 bg-white border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col shadow-sm relative">
      <div className="flex-1 overflow-y-auto bg-white max-h-64 sm:max-h-none">
        <ComponentLibrarySidebar
          onAddComponent={addComponent}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      </div>
    </div>
  );

  // Render floating plus button for collapsed sidebar state
  const renderFloatingPlusButton = () => (
    <div className="fixed left-0 top-16 bottom-0 z-50 w-10 bg-white border-r border-gray-200 shadow-lg">
      <button
        onClick={() => setShowSidebar(true)}
        className="w-full h-16 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:from-slate-100 hover:to-slate-50 transition-all duration-200 group"
        title="Add component"
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

  // Render the main drag and drop area
  const renderMainContent = () => (
    <div className="flex-1 overflow-y-auto py-5 ">
      <DragAndDropArea
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
    <div className="min-h-screen">
      {renderHeader()}
      <main className="flex flex-col sm:flex-row h-[calc(100vh-80px)]">
        {/* Conditional sidebar rendering */}
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

      {/* Confirmation modal for clearing components */}
      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear All Components"
        message="Are you sure you want to clear all components? This action cannot be undone and will remove all your work."
        onConfirm={clearComponents}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
}
