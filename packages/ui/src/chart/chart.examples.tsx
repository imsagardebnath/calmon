import { Chart } from '@openvanta/pikore-react/chart'

/** One series with a threshold. The limit is drawn as a dashed line and a band, and named in words. */
export function LineWithThreshold() {
  const latency = [
    { time: '10:00', p95: 310 },
    { time: '10:30', p95: 330 },
    { time: '11:00', p95: 320 },
    { time: '11:30', p95: 350 },
    { time: '12:00', p95: 372 },
    { time: '12:30', p95: 391 },
    { time: '13:00', p95: 405 },
    { time: '13:30', p95: 412 },
  ]

  return (
    <div className="w-[36rem] max-w-full">
      <Chart
        type="line"
        label="p95 latency, last 4 hours"
        data={latency}
        x="time"
        unit="ms"
        series={[{ key: 'p95', label: 'p95 latency' }]}
        threshold={{ value: 400, label: 'limit 400 ms', severity: 'caution' }}
      />
    </div>
  )
}

/** Several series share the axes. The hover and arrow-key readout lists every series at that point. */
export function TwoSeries() {
  const latency = [
    { time: '10:00', p95: 310, p50: 142 },
    { time: '11:00', p95: 330, p50: 150 },
    { time: '12:00', p95: 372, p50: 158 },
    { time: '13:00', p95: 405, p50: 171 },
    { time: '14:00', p95: 438, p50: 186 },
    { time: '15:00', p95: 452, p50: 190 },
  ]

  return (
    <div className="w-[36rem] max-w-full">
      <Chart
        label="Latency, all services"
        data={latency}
        x="time"
        unit="ms"
        series={[
          { key: 'p95', label: 'p95', color: 'caution' },
          { key: 'p50', label: 'p50', color: 'accent' },
        ]}
        threshold={{ value: 400, label: 'limit 400 ms' }}
      />
    </div>
  )
}

/** Area charts fill under the line. Use a dashed series and format to compare periods. */
export function AreaWithComparison() {
  const revenue = [
    { day: 'Mon', now: 152, before: 144 },
    { day: 'Tue', now: 158, before: 147 },
    { day: 'Wed', now: 171, before: 150 },
    { day: 'Thu', now: 166, before: 156 },
    { day: 'Fri', now: 183, before: 161 },
    { day: 'Sat', now: 205, before: 178 },
    { day: 'Sun', now: 198, before: 170 },
  ]

  return (
    <div className="w-[36rem] max-w-full">
      <Chart
        type="area"
        label="Revenue, this week and last"
        data={revenue}
        x="day"
        format={(v) => `$${v}k`}
        series={[
          { key: 'now', label: 'This week', color: 'accent' },
          { key: 'before', label: 'Last week', color: 'neutral', dashed: true },
        ]}
      />
    </div>
  )
}

/** Bars suit counts per period or per category. Colours stay on tokens: critical for errors, neutral for the rest. */
export function Bars() {
  const errors = [
    { hour: '12:00', e5xx: 24, e4xx: 71 },
    { hour: '13:00', e5xx: 31, e4xx: 66 },
    { hour: '14:00', e5xx: 29, e4xx: 80 },
    { hour: '15:00', e5xx: 118, e4xx: 74 },
    { hour: '16:00', e5xx: 245, e4xx: 69 },
  ]

  return (
    <div className="w-[36rem] max-w-full">
      <Chart
        type="bar"
        label="Errors per minute"
        data={errors}
        x="hour"
        unit="/min"
        series={[
          { key: 'e5xx', label: '5xx', color: 'critical' },
          { key: 'e4xx', label: '4xx', color: 'neutral' },
        ]}
      />
    </div>
  )
}

/** A floor instead of a ceiling: direction below shades under the line. Set min and max to zoom the axis. */
export function LowerLimit() {
  const spo2 = [
    { time: '08:00', spo2: 97 },
    { time: '09:00', spo2: 96 },
    { time: '10:00', spo2: 95 },
    { time: '11:00', spo2: 93 },
    { time: '12:00', spo2: 91 },
    { time: '13:00', spo2: 90 },
  ]

  return (
    <div className="w-[36rem] max-w-full">
      <Chart
        type="line"
        label="SpO2, last 6 hours"
        data={spo2}
        x="time"
        unit="%"
        min={84}
        max={100}
        height={180}
        series={[{ key: 'spo2', label: 'SpO2', color: 'critical' }]}
        threshold={{ value: 92, label: 'alarm below 92%', severity: 'critical', direction: 'below' }}
      />
    </div>
  )
}
