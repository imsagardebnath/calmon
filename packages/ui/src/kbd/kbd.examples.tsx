import { Kbd } from '@calmon/react/kbd'

/** One key. It renders a native kbd element. */
export function Key() {
  return <Kbd>Esc</Kbd>
}

/** A shortcut as a `+`-separated string becomes one cap per key. */
export function Shortcut() {
  return <Kbd>Ctrl+K</Kbd>
}

/** Or pass the keys as separate children. */
export function SeveralKeys() {
  return (
    <Kbd>
      {'Shift'}
      {'Alt'}
      {'P'}
    </Kbd>
  )
}

/** `mod` shows the reader's platform key: Cmd on a Mac and Ctrl everywhere else. */
export function PlatformKey() {
  return <Kbd>mod+K</Kbd>
}

/** In a sentence, keep the text small and the keys beside the action they trigger. */
export function InText() {
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-ui-sm text-fg-muted">
      Press <Kbd>mod+K</Kbd> to search, <Kbd>Esc</Kbd> to close.
    </p>
  )
}
