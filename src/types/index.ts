export interface Component {
  id: string;
  type: 'text' | 'image';
  content: string;
  width: number; // 1-12 for grid system
  position: { x: number; y: number };
}

export interface TextComponent extends Component {
  type: 'text';
  content: string; // markdown content
}

export interface ImageComponent extends Component {
  type: 'image';
  content: string; // image URL
  alt?: string;
}

export type ComponentType = TextComponent | ImageComponent;
