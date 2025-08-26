# Visual Builder

A drag-and-drop layout builder for creating responsive web layouts. Built with Next.js 15, React 19, and Tailwind CSS.

## What it does

Create layouts by dragging text and image components onto a 12-column grid. Everything saves automatically to your browser, and you can undo/redo changes with Ctrl+Z/Ctrl+Y.

### Features

- **Text blocks** with full markdown support
- **Image blocks** from any URL
- **Drag and drop** to reorder components
- **Resize components** by dragging the handles
- **Live preview** mode to see how it looks
- **Undo/redo** for all changes
- **Mobile responsive** - preview-only on mobile
- **Auto-save** to localStorage

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and start building.

## How to use

### Adding components
Click any component in the sidebar or drag it to the workspace. Components automatically find the next available spot.

### Editing
- Click text areas to edit with markdown
- Click image URLs to change the image
- Drag the resize handles to change component width
- Drag components around to reorder them

### Keyboard shortcuts
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

### Preview mode
Toggle between edit and preview to see your layout without the editing UI. On mobile, it's preview-only by default.

## Project structure

```
src/
├── app/page.tsx              # Main app component
├── components/
│   ├── Canvas.tsx           # Workspace with drag & drop
│   ├── ComponentPalette.tsx # Sidebar with components
│   ├── TextComponent.tsx    # Text editor
│   └── ImageComponent.tsx   # Image component
└── types/index.ts           # TypeScript types
```

## Tech stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Markdown** for text rendering
- **localStorage** for persistence

## Development

```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run lint   # Run ESLint
```

The code is structured to be maintainable and follows React best practices. Each component handles its own state and the main page orchestrates everything.

## State management

All data is stored in localStorage with these keys:
- `visual-builder-components` - Your layout data
- `visual-builder-history` - Undo/redo history
- `visual-builder-show-preview` - Preview mode state
- `visual-builder-is-editing` - Edit mode state
- `visual-builder-show-sidebar` - Sidebar visibility

The undo/redo system tracks every change and allows you to go back through your editing history.

## Responsive design

On desktop, you get full editing capabilities. On mobile (≤768px), it switches to preview-only mode since drag and drop doesn't work well on touch devices.

## Contributing

Feel free to submit issues or pull requests. The codebase is clean and well-typed with TypeScript.

---

Built with Next.js, React, and Tailwind CSS.
