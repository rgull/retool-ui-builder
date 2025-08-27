"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TextComponent as TextComponentType } from "@/types";

// Props definition for the TextComponent
interface TextComponentProps {
  component: TextComponentType;
  onUpdate: (updatedComponent: TextComponentType) => void; // Called when content/size/position changes are finalized
  onUpdateResize: (updatedComponent: TextComponentType) => void; // Called during live resize (dragging handles)
  onDelete: (id: string) => void;
  isEditing: boolean;
}

export default function TextComponent({
  component,
  onUpdate,
  onUpdateResize,
  onDelete,
  isEditing,
}: TextComponentProps) {
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Handle content editing (markdown text).
   * Only fires when the textarea changes in editing mode.
   */
  const handleContentChange = (content: string) => {
    onUpdate({
      ...component,
      content,
    });
  };

  /**
   * Handle resize start (called when clicking + dragging a resize handle).
   * Direction = "left" or "right".
   */
  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "left" | "right"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Initial mouse position & component dimensions
    const startX = e.clientX;
    const startWidth = component.width;
    const startPosition = component.position.x;

    // Track final width & position during drag
    let finalWidth = startWidth;
    let finalPosition = startPosition;

    /**
     * Handle mouse move while resizing.
     * Updates width + position in "live" mode via onUpdateResize().
     */
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const gridWidth = 100; // Approximate pixel width of one grid column
      const deltaColumns = Math.round(deltaX / gridWidth); // Convert pixels → grid columns

      let newWidth = startWidth;
      let newPosition = startPosition;

      if (direction === "left") {
        // Resizing from the left:
        // width decreases as we drag right, and x-position shifts right
        newWidth = Math.max(1, Math.min(12, startWidth - deltaColumns));
        newPosition = startPosition + (startWidth - newWidth);
      } else {
        // Resizing from the right:
        // only width changes, position stays the same
        newWidth = Math.max(1, Math.min(12, startWidth + deltaColumns));
        newPosition = startPosition;
      }

      // Ensure the component stays within the 12-column grid
      if (newPosition + newWidth <= 12 && newPosition >= 0) {
        finalWidth = newWidth;
        finalPosition = newPosition;

        // Update only if width/position actually changed
        if (
          newWidth !== component.width ||
          newPosition !== component.position.x
        ) {
          onUpdateResize({
            ...component,
            width: newWidth,
            position: { ...component.position, x: newPosition },
          });
        }
      }
    };

    /**
     * Handle mouse release.
     * Finalize the resize with `onUpdate()`, so it’s added to history.
     */
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const finalComponent = {
        ...component,
        width: finalWidth,
        position: { ...component.position, x: finalPosition },
      };
      onUpdate(finalComponent);
    };

    // Attach listeners for live drag events
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  /**
   * Detect mobile devices (<=768px width).
   * Forces preview-only mode on mobile.
   */
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`relative transition-all duration-200 ${
        isEditing
          ? "border-2 border-dashed border-slate-300 hover:border-slate-400 md:cursor-move hover:bg-slate-50"
          : "border-0"
      }`}
      style={{
        // On mobile: full width (span 12)
        gridColumn: isMobile
          ? "span 12"
          : `${component.position.x + 1} / span ${component.width}`,
        gridRow: isMobile ? "auto" : `${component.position.y + 1}`,
        minHeight: "100px",
      }}
      draggable={isEditing && !isMobile} // Only draggable in desktop edit mode
      data-component-id={component.id}
      data-component-type="move"
      onDragStart={(e) => {
        if (!isMobile) {
          e.dataTransfer.setData("componentId", component.id);
          e.dataTransfer.setData("componentType", "move");

          // Visual feedback while dragging
          e.currentTarget.style.opacity = "0.5";
          e.currentTarget.style.transform = "rotate(2deg)";
        }
      }}
      onDragEnd={(e) => {
        if (!isMobile) {
          // Reset visual feedback after drag ends
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "rotate(0deg)";
        }
      }}
    >
      {/* Resize handles (visible only in editing mode on desktop) */}
      {isEditing && !isMobile && (
        <>
          {/* Left resize handle */}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-12 bg-slate-600 cursor-ew-resize rounded-r hover:bg-slate-700 transition-all duration-200 shadow-md flex items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "left")}
            title="Drag to resize"
          >
            <div className="w-1 h-6 bg-white rounded opacity-80"></div>
          </div>

          {/* Right resize handle */}
          <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-12 bg-slate-600 cursor-ew-resize rounded-l hover:bg-slate-700 transition-all duration-200 shadow-md flex items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "right")}
            title="Drag to resize"
          >
            <div className="w-1 h-6 bg-white rounded opacity-80"></div>
          </div>
        </>
      )}

      {/* Component label + delete button (visible only in edit mode) */}
      {isEditing && !isMobile && (
        <div className="absolute -top-3 left-2 bg-slate-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
          <span className="font-semibold tracking-tight">
            Text ({component.width}/12)
          </span>
          <button
            onClick={() => onDelete(component.id)}
            className="ml-2 hover:bg-slate-800 rounded px-1 transition-colors"
            title="Delete component"
          >
            ×
          </button>
        </div>
      )}

      {/* Content (editable textarea in edit mode, markdown preview in preview mode) */}
      <div className="w-full h-full bg-white">
        {isEditing && !isMobile ? (
          <textarea
            value={component.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full text-black h-full min-h-[80px] p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm bg-white"
            placeholder="Enter markdown text here..."
          />
        ) : (
          <div className="prose prose-sm max-w-none prose-slate bg-white p-4 rounded-lg shadow-sm">
            <ReactMarkdown>{component.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
