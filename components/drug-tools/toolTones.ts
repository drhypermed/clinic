import type { ToolTone } from './ToolCard';

export const TOOL_TONES: Record<'interactions' | 'renal' | 'pregnancy' | 'edit', ToolTone> = {
  interactions: {
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)]',
  },
  renal: {
    gradient: 'bg-gradient-to-br from-emerald-600 to-green-700',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)]',
  },
  pregnancy: {
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(6,182,212,0.5)]',
  },
  edit: {
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-700',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)]',
  },
};
