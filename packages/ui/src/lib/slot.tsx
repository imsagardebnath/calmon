import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react'
import { cn } from './cn.ts'

type SlotProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement>; children?: ReactNode }

type ChildProps = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }

type Handler = (...args: unknown[]) => void

const isHandlerName = (name: string) => /^on[A-Z]/.test(name)

const isDefaultPrevented = (event: unknown) =>
  typeof event === 'object' && event !== null && 'defaultPrevented' in event && event.defaultPrevented === true

/** Call every handler in order. The child's runs first, and the Slot's is skipped once the child prevented the default action. */
const composeHandlers =
  (child: Handler, slot: Handler): Handler =>
  (...args) => {
    child(...args)
    if (!isDefaultPrevented(args[0])) slot(...args)
  }

/** Point two refs at the same element. Cleanup functions returned by callback refs are honoured. */
function mergeRefs(slot: Ref<HTMLElement> | undefined, child: Ref<HTMLElement> | undefined): Ref<HTMLElement> | undefined {
  if (!slot || !child) return slot ?? child
  const refs = [slot, child]
  const merged: RefCallback<HTMLElement> = (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node)
      ref.current = node
      return undefined
    })
    return () => {
      refs.forEach((ref, i) => {
        const cleanup = cleanups[i]
        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else ref.current = null
      })
    }
  }
  return merged
}

// `process.env.NODE_ENV` is replaced by the app's bundler. Without one it does not exist, so stay quiet.
declare const process: { env: { NODE_ENV?: string } }
function isDev() {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

let warned = false

/**
 * Renders its single child element instead of a wrapper, merging the Slot's props into it.
 * Used for `asChild`.
 *
 * - `className` is merged (the child's classes come last, so they win conflicts).
 * - Event handlers (`onClick` and so on) on both run, the child's first. If the child's handler calls
 *   `preventDefault()`, the Slot's handler is skipped.
 * - `style` objects are merged, and the child's values win.
 * - `ref`s on both are set.
 * - Any other prop on the child wins over the same prop on the Slot.
 *
 * The child must be a single React element. Anything else renders nothing, and warns in development.
 */
export function Slot({ children, className, style, ref, ...props }: SlotProps) {
  if (!isValidElement(children)) {
    if (!warned && isDev()) {
      warned = true
      console.warn('Slot: expected a single React element as the only child (for example an <a> or a router <Link>).')
    }
    return null
  }
  const child = children as ReactElement<ChildProps>
  const { className: childClassName, style: childStyle, ref: childRef, ...childProps } = child.props

  const merged: Record<string, unknown> = { ...props, ...childProps }
  for (const [name, slotValue] of Object.entries(props)) {
    const childValue = (childProps as Record<string, unknown>)[name]
    if (isHandlerName(name) && typeof slotValue === 'function' && typeof childValue === 'function') {
      merged[name] = composeHandlers(childValue as Handler, slotValue as Handler)
    }
  }

  return cloneElement(child, {
    ...merged,
    className: cn(className, childClassName),
    style: style || childStyle ? ({ ...style, ...childStyle } as CSSProperties) : undefined,
    ref: mergeRefs(ref, childRef),
  } as Partial<ChildProps>)
}
