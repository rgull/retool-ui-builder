'use client';

import React, { useState, useEffect } from 'react';
import { ImageComponent as ImageComponentType } from '@/types';

interface ImageComponentProps {
  component: ImageComponentType;
  onUpdate: (updatedComponent: ImageComponentType) => void;
  onUpdateResize: (updatedComponent: ImageComponentType) => void;
  onResize: (width: number) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export default function ImageComponent({ 
  component, 
  onUpdate, 
  onUpdateResize,
  onResize, 
  onDelete,
  isEditing,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: ImageComponentProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [altText, setAltText] = useState(component.alt || '');
  const [isMobile, setIsMobile] = useState(false);

  const handleUrlChange = (url: string) => {
    onUpdate({
      ...component,
      content: url
    });
  };

  const handleAltChange = (alt: string) => {
    setAltText(alt);
    onUpdate({
      ...component,
      alt
    });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = component.width;
    const startPosition = component.position.x;
    
    let finalWidth = startWidth;
    let finalPosition = startPosition;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const gridWidth = 100; // Approximate width of one grid column
      const deltaColumns = Math.round(deltaX / gridWidth);
      
      let newWidth = startWidth;
      let newPosition = startPosition;
      
      if (direction === 'left') {
        // When resizing from left, decrease width and move position right
        newWidth = Math.max(1, Math.min(12, startWidth - deltaColumns));
        newPosition = startPosition + (startWidth - newWidth);
      } else {
        // When resizing from right, just change width
        newWidth = Math.max(1, Math.min(12, startWidth + deltaColumns));
        newPosition = startPosition;
      }
      
      // Ensure the component doesn't go outside the grid
      if (newPosition + newWidth <= 12 && newPosition >= 0) {
        finalWidth = newWidth;
        finalPosition = newPosition;
        
        if (newWidth !== component.width || newPosition !== component.position.x) {
          onUpdateResize({
            ...component,
            width: newWidth,
            position: { ...component.position, x: newPosition }
          });
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Add to history when resize operation ends with the final values
      const finalComponent = {
        ...component,
        width: finalWidth,
        position: { ...component.position, x: finalPosition }
      };
      onUpdate(finalComponent);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Set mobile detection on mount
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWidthChange = (newWidth: number) => {
    if (newWidth >= 1 && newWidth <= 12) {
      onResize(newWidth);
    }
  };

  return (
         <div 
       className={`relative transition-all duration-200 bg-white ${
         isEditing 
           ? 'border-2 border-dashed border-slate-300 hover:border-slate-400 md:cursor-move hover:bg-slate-50' 
           : 'border-0'
       }`}
             style={{ 
         gridColumn: isMobile ? 'span 12' : `${component.position.x + 1} / span ${component.width}`,
         gridRow: isMobile ? 'auto' : `${component.position.y + 1}`,
         minHeight: '100px'
       }}
       draggable={isEditing && !isMobile}
      data-component-id={component.id}
      data-component-type="move"
             onDragStart={(e) => {
         if (!isMobile) {
           e.dataTransfer.setData('componentId', component.id);
           e.dataTransfer.setData('componentType', 'move');
           // Add visual feedback during drag
           e.currentTarget.style.opacity = '0.5';
           e.currentTarget.style.transform = 'rotate(2deg)';
         }
       }}
       onDragEnd={(e) => {
         if (!isMobile) {
           // Remove visual feedback after drag
           e.currentTarget.style.opacity = '1';
           e.currentTarget.style.transform = 'rotate(0deg)';
         }
       }}
      onTouchStart={(e) => {
        // Disabled on mobile - preview only
      }}
      onTouchMove={(e) => {
        // Disabled on mobile - preview only
      }}
      onTouchEnd={(e) => {
        // Disabled on mobile - preview only
      }}
    >
                     {/* Resize handles */}
        {isEditing && (
          <>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-12 bg-slate-600 cursor-ew-resize rounded-r hover:bg-slate-700 transition-all duration-200 shadow-md flex items-center justify-center"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
              title="Drag to resize"
            >
              <div className="w-1 h-6 bg-white rounded opacity-80"></div>
            </div>
            <div 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-12 bg-slate-600 cursor-ew-resize rounded-l hover:bg-slate-700 transition-all duration-200 shadow-md flex items-center justify-center"
              title="Drag to resize"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
              <div className="w-1 h-6 bg-white rounded opacity-80"></div>
            </div>
          </>
        )}

                           {/* Component label and delete button */}
        {isEditing && (
                     <div className="absolute -top-3 left-2 bg-slate-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
             <span className="font-semibold tracking-tight">Image ({component.width}/12)</span>
            <button
              onClick={() => onDelete(component.id)}
              className="ml-2 hover:bg-slate-800 rounded px-1 transition-colors"
              title="Delete component"
            >
              ×
            </button>
          </div>
        )}

             {/* Content */}
       <div className="w-full h-full">
         {isEditing ? (
           <div className="space-y-3">
             <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1 tracking-tight">
                  Image URL
                </label>
                               <input
                  type="url"
                  value={component.content}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="https://placehold.co/600x400"
                />
             </div>
             

           </div>
                   ) : (
            <div className="w-full h-full flex items-center justify-center">
              {component.content ? (
                <img
                  src={component.content}
                  alt={altText}
                  className="w-full h-auto max-h-96 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
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
