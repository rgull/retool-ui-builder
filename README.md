# Overview

A drag-and-drop layout builder for creating responsive web layouts. Built with Next.js 15, React 19, and Tailwind CSS.

## What it does

Create layouts by dragging text and image components onto a 12-column grid. Everything saves automatically to your browser, and you can undo/redo changes with Ctrl+Z/Ctrl+Y.

### Features

- **Text blocks** with full markdown support
- **Image blocks** from any URL
- **Drag and drop** to reorder components
- **Resize components** by dragging the edges
- **Undo/redo** for all changes
- **Mobile responsive** - preview-only on mobile
- **Auto-save** to localStorage


### Adding components

Click any component in the sidebar or drag it to the workspace. Components automatically find the next available spot.

### Editing

- Click text areas to edit with markdown
- Click image URLs to change the image
- Drag the edges to change component width
- Drag components around to reorder them

### Keyboard shortcuts

- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

### Preview mode

Toggle between edit and preview to see your layout without the editing UI.

## Development

```bash
npm install    # install packages
npm run dev    # Start dev server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## State management

All data is stored in localStorage.

The undo/redo system tracks every change and allows you to go back through your editing history.
