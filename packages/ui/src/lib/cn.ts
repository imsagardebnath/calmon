import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const tones = ['accent', 'normal', 'info', 'advisory', 'caution', 'critical']
const suffixes = ['', '-on', '-soft', '-fg', '-border']

/** Teach tailwind-merge the Calmon token names so overrides merge predictably. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'surface',
        'surface-raised',
        'surface-sunken',
        'border-strong',
        'fg',
        'fg-muted',
        'fg-subtle',
        'ring',
        ...[...tones, 'tone'].flatMap((t) => suffixes.map((s) => `${t}${s}`)),
      ],
      text: ['ui', 'ui-sm', 'numeral-sm', 'numeral-md', 'numeral-lg', 'numeral-xl'],
      radius: ['control', 'card', 'pill'],
      shadow: ['low', 'mid', 'high'],
      animate: [
        'calmon-spin',
        'calmon-shim',
        'calmon-indet',
        'calmon-crit',
        'calmon-blink',
        'calmon-pop',
        'calmon-dialog',
        'calmon-slide',
        'calmon-toast-out',
      ],
      ease: ['calmon'],
    },
  },
})

/** Join class names and resolve Tailwind conflicts (the last one wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
