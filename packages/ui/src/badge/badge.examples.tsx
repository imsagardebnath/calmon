import { Badge } from '@openvanta/pikore-react/badge'

/** Each severity has its own icon shape (check, i, diamond, triangle, octagon), so colour is never the only signal. */
export function Severity() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge severity="normal">Normal</Badge>
      <Badge severity="info">Info</Badge>
      <Badge severity="advisory">Advisory</Badge>
      <Badge severity="caution">Caution</Badge>
      <Badge severity="critical">Critical</Badge>
    </div>
  )
}

/** Variants from quiet to loud. Save solid for problems, never for normal status. */
export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge severity="caution">Soft</Badge>
      <Badge severity="caution" variant="solid">
        Solid
      </Badge>
      <Badge severity="caution" variant="outline">
        Outline
      </Badge>
      <Badge severity="caution" variant="dot">
        Dot
      </Badge>
    </div>
  )
}

/** Intent aliases map onto severities: danger is critical, warning is caution, success is normal. */
export function Intent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge intent="success">Live</Badge>
      <Badge intent="warning">Degraded</Badge>
      <Badge intent="danger" variant="solid">
        Failed
      </Badge>
      <Badge intent="primary">New</Badge>
    </div>
  )
}

/** Without a severity or intent a badge is a neutral label. */
export function Neutral() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Draft</Badge>
      <Badge variant="solid">Draft</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="dot">Draft</Badge>
    </div>
  )
}

/** Hide the automatic icon with `icon={false}`, or pass your own. The text still says what it is. */
export function Icons() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge severity="critical" icon={false}>
        Down
      </Badge>
      <Badge severity="info" icon={<span>#</span>}>
        3 new
      </Badge>
    </div>
  )
}
