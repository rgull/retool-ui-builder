"use client";

import React, { useState, useEffect } from "react";

interface ImageComponentProps {
  component: any;
  onUpdate: (updatedComponent: any) => void; // Called when image content/alt/position is updated
  onUpdateResize: (updatedComponent: any) => void; // Called during resize (live updates)
  onDelete: (id: string) => void; // Delete component by ID
  isEditing: boolean; // Flag to toggle between edit and preview mode
}
//Image Url regex
const IMAGE_URL_REGEX = /^https?:\/\/[^\s]+$/i;

export default function ImageComponent({
  component,
  onUpdate,
  onUpdateResize,
  onDelete,
  isEditing,
}: ImageComponentProps) {
  const [isMobile, setIsMobile] = useState(false); // Tracks mobile mode (preview only)
  const [error, setError] = useState("");

  // Update component with new image URL
  const handleUrlChange = (url: string) => {
    onUpdate({
      ...component,
      content: url,
    });
  };

  //Image Component Url Chnage
  const handleChange = (value: string) => {
    handleUrlChange(value); // always update the field

    if (!IMAGE_URL_REGEX.test(value) && value.trim() !== "") {
      setError(
        "Please enter a valid image URL (e.g. https://placehold.co/600x400/orange/white)"
      );
    } else {
      setError("");
    }
  };

  // Handle resize (dragging left or right handles)
  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "left" | "right"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX; // Initial mouse X
    const startWidth = component.width; // Current width in grid columns
    const startPosition = component.position.x; // Current X position in grid

    let finalWidth = startWidth;
    let finalPosition = startPosition;

    // While dragging, update live width/position
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const gridWidth = 100; // Approximate px size of one grid column
      const deltaColumns = Math.round(deltaX / gridWidth); // Convert px → columns

      let newWidth = startWidth;
      let newPosition = startPosition;

      if (direction === "left") {
        // Resizing from left decreases width & shifts position
        newWidth = Math.max(1, Math.min(12, startWidth - deltaColumns));
        newPosition = startPosition + (startWidth - newWidth);
      } else {
        // Resizing from right only changes width
        newWidth = Math.max(1, Math.min(12, startWidth + deltaColumns));
        newPosition = startPosition;
      }

      // Ensure image stays within 12-column grid
      if (newPosition + newWidth <= 12 && newPosition >= 0) {
        finalWidth = newWidth;
        finalPosition = newPosition;

        // Update live resize preview
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

    // When drag ends  commit final size
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

    // Attach mouse listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Detect mobile (preview-only mode)
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
      className={`relative transition-all duration-200 bg-white ${
        isEditing
          ? "border-2 border-dashed border-slate-300 hover:border-slate-400 md:cursor-move"
          : "border-0"
      }`}
      style={{
        gridColumn: isMobile
          ? "span 12" // Full width on mobile
          : `${component.position.x + 1} / span ${component.width}`, // Grid placement on desktop
        gridRow: isMobile ? "auto" : `${component.position.y + 1}`,
        minHeight: "100px",
      }}
      draggable={isEditing && !isMobile} // Enable drag only on desktop while editing
      data-component-id={component.id}
      data-component-type="move"
      onDragStart={(e) => {
        if (!isMobile) {
          e.dataTransfer.setData("componentId", component.id);
          e.dataTransfer.setData("componentType", "move");
          // Add drag feedback
          e.currentTarget.style.opacity = "0.5";
          e.currentTarget.style.transform = "rotate(2deg)";
        }
      }}
      onDragEnd={(e) => {
        if (!isMobile) {
          // Reset after drag ends
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "rotate(0deg)";
        }
      }}
      onTouchStart={() => {
        // Disabled for now → preview-only on mobile
      }}
      onTouchMove={() => {}}
      onTouchEnd={() => {}}
    >
      {/* Resize handles */}
      {isEditing && (
        <>
          {/* Left handle */}
          <div
            className="absolute left-0 top-1/2 transform h-full cursor-ew-resize rounded-r flex items-center justify-center"
            onMouseDown={(e) => handleResizeStart(e, "left")}
            title="Drag to resize"
          >
            <div className="w-1 h-6 bg-white rounded opacity-80"></div>
          </div>
          {/* Right handle */}
          <div
            className="absolute right-0 top-1/2 transform h-full cursor-ew-resize rounded-r flex items-center justify-center"
            title="Drag to resize"
            onMouseDown={(e) => handleResizeStart(e, "right")}
          >
            <div className="w-1 h-6 bg-white rounded opacity-80"></div>
          </div>
        </>
      )}

      {/* Component label & delete button (only in editing mode) */}
      {isEditing && (
        <div className="absolute -top-3 left-2 bg-slate-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
          <span className="font-semibold tracking-tight">
            Image ({component.width}/12)
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

      {/*  Main content (edit vs preview) */}
      <div className="w-full h-full">
        {isEditing ? (
          // Edit mode  input for image URL
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 tracking-tight">
                Image URL
              </label>
              <input
                type="url"
                value={component.content}
                onChange={(e) => handleChange(e.target.value)}
                className={`w-full p-3 text-black border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  error
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="https://placehold.co/600x400/orange/white"
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
          </div>
        ) : (
          // Preview mode  show image or fallback
          <div className="w-full h-full flex items-center justify-center">
            {component.content ? (
              <img
                src={component.content}
                alt={"invalid image"}
                className="w-full h-auto max-h-96 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  // Show placeholder if image fails to load
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                }}
              />
            ) : (
              <div className="text-gray-400 text-center bg-white p-4 rounded-lg shadow-sm">
                <div className="text-4xl mb-2">🖼️</div>
                <div>No image URL provided</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
