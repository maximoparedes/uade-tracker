import type { ColorKey } from '../types'

export interface ColorConfig {
  border: string
  text: string
  bg: string
  dot: string
  blockBorder: string
  blockBg: string
}

export const COLORS: Record<ColorKey, ColorConfig> = {
  cyan: {
    border: 'border-cyan-400',
    text: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    dot: 'bg-cyan-400',
    blockBorder: 'border-l-cyan-400',
    blockBg: 'bg-cyan-400/15',
  },
  sky: {
    border: 'border-sky-400',
    text: 'text-sky-400',
    bg: 'bg-sky-400/10',
    dot: 'bg-sky-400',
    blockBorder: 'border-l-sky-400',
    blockBg: 'bg-sky-400/15',
  },
  blue: {
    border: 'border-blue-400',
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
    dot: 'bg-blue-400',
    blockBorder: 'border-l-blue-400',
    blockBg: 'bg-blue-400/15',
  },
  violet: {
    border: 'border-violet-400',
    text: 'text-violet-400',
    bg: 'bg-violet-400/10',
    dot: 'bg-violet-400',
    blockBorder: 'border-l-violet-400',
    blockBg: 'bg-violet-400/15',
  },
  purple: {
    border: 'border-purple-400',
    text: 'text-purple-400',
    bg: 'bg-purple-400/10',
    dot: 'bg-purple-400',
    blockBorder: 'border-l-purple-400',
    blockBg: 'bg-purple-400/15',
  },
  green: {
    border: 'border-green-400',
    text: 'text-green-400',
    bg: 'bg-green-400/10',
    dot: 'bg-green-400',
    blockBorder: 'border-l-green-400',
    blockBg: 'bg-green-400/15',
  },
  amber: {
    border: 'border-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    dot: 'bg-amber-400',
    blockBorder: 'border-l-amber-400',
    blockBg: 'bg-amber-400/15',
  },
  rose: {
    border: 'border-rose-400',
    text: 'text-rose-400',
    bg: 'bg-rose-400/10',
    dot: 'bg-rose-400',
    blockBorder: 'border-l-rose-400',
    blockBg: 'bg-rose-400/15',
  },
}

export const COLOR_PALETTE: ColorKey[] = ['cyan', 'sky', 'blue', 'violet', 'purple', 'green', 'amber', 'rose']
