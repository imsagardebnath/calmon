'use client'

import type { ComponentPropsWithRef } from 'react'
import { cn } from '../lib/cn.ts'

/** The environments a record can live in. */
export type Environment = 'prod' | 'staging' | 'dev'

/*
 * A small mono tag whose text is the signal, so it needs no icon. PROD and STAGING are solid
 * (critical, advisory); DEV is soft (info) so it stays quiet.
 */
const BASE =
  'inline-flex h-5 shrink-0 items-center rounded-[5px] px-1.5 font-mono text-[10.5px] font-medium tracking-[.04em] whitespace-nowrap'
const SOLID = 'bg-tone text-tone-on'
const SOFT = 'bg-tone-soft text-tone-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--s-border),transparent_35%)]'

const ENV = {
  prod: { tone: 'critical', label: 'PROD', look: SOLID },
  staging: { tone: 'advisory', label: 'STAGING', look: SOLID },
  dev: { tone: 'info', label: 'DEV', look: SOFT },
} as const

export type EnvironmentBadgeProps = Omit<ComponentPropsWithRef<'span'>, 'color'> & {
  /** Which environment. `prod` is a solid critical tag, `staging` a solid advisory one, `dev` a quiet info one. Required. */
  env: 'prod' | 'staging' | 'dev'
}

/**
 * Names the environment in capitals: PROD, STAGING or DEV. Show it beside the name of anything a person
 * is about to change, so nobody edits production while thinking they are in staging.
 */
export function EnvironmentBadge({ env, className, children, ...props }: EnvironmentBadgeProps) {
  const { tone, label, look } = ENV[env]
  return (
    <span data-tone={tone} className={cn(BASE, look, className)} {...props}>
      {children ?? label}
    </span>
  )
}
