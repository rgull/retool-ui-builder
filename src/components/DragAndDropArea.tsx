"use client";

import React, { useState, useCallback } from "react";
import { ComponentType } from "@/types";
import TextComponentRenderer from "./TextComponent";
import ImageComponentRenderer from "./ImageComponent";

interface DragAndDropAreaProps {
  components: ComponentType[];
  onUpdateComponent: (updatedComponent: ComponentType) => void;
  onUpdateComponentResize: (updatedComponent: ComponentType) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: "text" | "image") => void;
  onReorderComponents: (components: ComponentType[]) => void;
  isEditing: boolean;
}

interface GridPosition {
  x: number;
  y: number;
}

const GRID_COLUMNS = 12;

export default function DragAndDropArea({
  components,
  onUpdateComponent,
  onUpdateComponentResize,
  onDeleteComponent,
  onAddComponent,
  onReorderComponents,
  isEditing,
}: DragAndDropAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const calculateGridPosition = useCallback(
    (dropX: number, dropY: number, containerWidth: number): GridPosition => {
      const gridWidth = containerWidth / GRID_COLUMNS;
      const gridX = Math.max(
        0,
        Math.min(GRID_COLUMNS - 1, Math.floor(dropX / gridWidth))
      );

      const rowHeight = 80;
      const gridY = Math.max(0, Math.floor(dropY / rowHeight));

      return { x: gridX, y: gridY };
    },
    []
  );

  const handleComponentReorder = useCallback(
    (e: React.DragEvent) => {
      const componentId = e.dataTransfer.getData("componentId");
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;

      const { x: gridX, y: gridY } = calculateGridPosition(
        dropX,
        dropY,
        rect.width
      );
      const draggedComponent = components.find((c) => c.id === componentId);

      if (!draggedComponent) return;

      const targetComponent = components.find(
        (c) =>
          c.id !== componentId &&
          c.position.y === gridY &&
          gridX >= c.position.x &&
          gridX < c.position.x + c.width
      );

      let updatedComponents = [...components];

      if (targetComponent) {
        updatedComponents = components.map((c) => {
          if (c.id === componentId) {
            return { ...c, position: targetComponent.position };
          } else if (c.id === targetComponent.id) {
            return { ...c, position: draggedComponent.position };
          }
          return c;
        });
      } else {
        const newPosition = { x: gridX, y: gridY };

        if (newPosition.x + draggedComponent.width > GRID_COLUMNS) {
          newPosition.x = Math.max(0, GRID_COLUMNS - draggedComponent.width);
        }

        updatedComponents = components.map((c) => {
          if (c.id === componentId) {
            return { ...c, position: newPosition };
          }
          return c;
        });
      }

      onReorderComponents(updatedComponents);
    },
    [components, calculateGridPosition, onReorderComponents]
  );

  const handleResize = useCallback(
    (id: string, newWidth: number) => {
      const component = components.find((c) => c.id === id);
      if (component) {
        onUpdateComponent({
          ...component,
          width: newWidth,
        });
      }
    },
    [components, onUpdateComponent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const componentType = e.dataTransfer.getData("componentType");

      if (componentType === "move") {
        handleComponentReorder(e);
      } else if (componentType === "text" || componentType === "image") {
        onAddComponent(componentType);
      }
    },
    [onAddComponent, handleComponentReorder]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const renderComponent = useCallback(
    (component: ComponentType) => {
      const commonProps = {
        onUpdate: onUpdateComponent,
        onUpdateResize: onUpdateComponentResize,
        onDelete: onDeleteComponent,
        isEditing,
      };

      switch (component.type) {
        case "text":
          return (
            <TextComponentRenderer
              key={component.id}
              component={component}
              {...commonProps}
            />
          );
        case "image":
          return (
            <ImageComponentRenderer
              key={component.id}
              component={component}
              {...commonProps}
            />
          );
        default:
          return null;
      }
    },
    [
      onUpdateComponent,
      onUpdateComponentResize,
      onDeleteComponent,
      isEditing,
      handleResize,
    ]
  );

  const gridItems = components
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    .map(renderComponent);

  const maxY =
    components.length > 0
      ? Math.max(...components.map((c) => c.position.y))
      : 0;
  const gridRows = maxY + 1;

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h4 className="text-xl font-semibold mb-2 text-slate-600 tracking-tight">
        Empty Workspace
      </h4>
      <p className="text-center max-w-md text-slate-500">
        {isEditing
          ? "Add components from the palette to start building your layout"
          : "No components to display"}
      </p>
    </div>
  );

  const renderDragOverState = () => (
    <div className="flex flex-col items-center justify-center h-96 text-slate-600">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h4 className="text-xl font-semibold mb-2 tracking-tight">
        Drop to Reorder
      </h4>
      <p className="text-center max-w-md text-slate-500">
        Release to place the component in this position
      </p>
    </div>
  );

  const renderGridOverlay = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div className="grid grid-cols-12 h-full opacity-5">
        {Array.from({ length: GRID_COLUMNS }, (_, i) => (
          <div
            key={i}
            className="bg-slate-300 border border-slate-200 rounded-sm"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`h-full relative transition-all duration-200 ${
        isDragOver ? "bg-blue-50" : ""
      } ${!isEditing ? "bg-white" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {components.length === 0 ? (
        renderEmptyState()
      ) : isDragOver ? (
        renderDragOverState()
      ) : (
        <div
          className={`grid grid-cols-12 w-full ${
            !isEditing ? "gap-4 p-6" : ""
          }`}
          style={{
            gridTemplateRows: `repeat(${Math.max(
              gridRows,
              1
            )}, minmax(100px, auto))`,
          }}
        >
          {gridItems}
        </div>
      )}

      {isEditing && renderGridOverlay()}
    </div>
  );
}
