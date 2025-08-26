'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { TextComponent as TextComponentType } from '@/types';

interface TextComponentProps {
  component: TextComponentType;
  onUpdate: (updatedComponent: TextComponentType) => void;
  onUpdateResize: (updatedComponent: TextComponentType) => void;
  onResize: (width: number) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export default function TextComponent({ 
  component, 
  onUpdate, 
  onUpdateResize,
  onResize, 
  onDelete,
  isEditing,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: TextComponentProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleContentChange = (content: string) => {
    onUpdate({
      ...component,
      content
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
       className={`relative transition-all duration-200 ${
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
              onMouseDown={(e) => handleResizeStart(e, 'right')}
              title="Drag to resize"
            >
              <div className="w-1 h-6 bg-white rounded opacity-80"></div>
            </div>
          </>
        )}

                          {/* Component label and delete button */}
        {isEditing && (
                     <div className="absolute -top-3 left-2 bg-slate-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-2 shadow-md">
             <span className="font-semibold tracking-tight">Text ({component.width}/12)</span>
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
        <div className="w-full h-full bg-white">
          {isEditing ? (
            <textarea
              value={component.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full min-h-[80px] p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm bg-white"
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
