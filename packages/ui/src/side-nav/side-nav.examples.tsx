import { BellOffIcon, GridIcon, PulseIcon, SettingsIcon, TimelineIcon, UserIcon } from '@openvanta/calmon-react/icons'
import { SideNav, SideNavGroup, SideNavItem } from '@openvanta/calmon-react/side-nav'
import { useState, type ComponentPropsWithRef } from 'react'

/** A group with a heading, icons, and an alert count on the item that needs action. The current page has aria-current. */
export function AppNavigation() {
  return (
    <div className="w-60">
      <SideNav aria-label="Main">
        <SideNavGroup label="Monitor">
          <SideNavItem icon={<GridIcon />} href="#/station" badge={{ severity: 'critical', count: 1 }} active>
            Station
          </SideNavItem>
          <SideNavItem icon={<PulseIcon />} href="#/services">
            Services
          </SideNavItem>
          <SideNavItem icon={<TimelineIcon />} href="#/timeline">
            Timeline
          </SideNavItem>
        </SideNavGroup>
      </SideNav>
    </div>
  )
}

/** Several groups, each with its own heading. Show counts only where someone has to act. */
export function Groups() {
  return (
    <div className="w-60">
      <SideNav aria-label="Main">
        <SideNavGroup label="Monitor">
          <SideNavItem icon={<GridIcon />} href="#/station" badge={{ severity: 'critical', count: 2 }}>
            Station
          </SideNavItem>
          <SideNavItem icon={<PulseIcon />} href="#/services" badge={{ severity: 'caution', count: 5 }} active>
            Services
          </SideNavItem>
          <SideNavItem icon={<TimelineIcon />} href="#/timeline">
            Timeline
          </SideNavItem>
        </SideNavGroup>
        <SideNavGroup label="Configure">
          <SideNavItem icon={<BellOffIcon />} href="#/silences">
            Silences
          </SideNavItem>
          <SideNavItem icon={<UserIcon />} href="#/people">
            People
          </SideNavItem>
          <SideNavItem icon={<SettingsIcon />} href="#/settings">
            Settings
          </SideNavItem>
        </SideNavGroup>
      </SideNav>
    </div>
  )
}

/** A group inside a group gets a smaller sub-heading and indented items. */
export function NestedGroups() {
  return (
    <div className="w-60">
      <SideNav aria-label="Documentation">
        <SideNavGroup label="Components">
          <SideNavGroup label="Actions">
            <SideNavItem href="#/button">Button</SideNavItem>
            <SideNavItem href="#/icon-button" active>
              IconButton
            </SideNavItem>
          </SideNavGroup>
          <SideNavGroup label="Navigation">
            <SideNavItem href="#/tabs">Tabs</SideNavItem>
            <SideNavItem href="#/pagination">Pagination</SideNavItem>
          </SideNavGroup>
        </SideNavGroup>
      </SideNav>
    </div>
  )
}

/** An icon-only rail. Labels are still read out and show as tooltips. The count stays a number. */
export function Collapsed() {
  return (
    <SideNav collapsed aria-label="Main">
      <SideNavGroup label="Monitor">
        <SideNavItem icon={<GridIcon />} href="#/station" badge={{ severity: 'critical', count: 1 }} active>
          Station
        </SideNavItem>
        <SideNavItem icon={<PulseIcon />} href="#/services">
          Services
        </SideNavItem>
        <SideNavItem icon={<TimelineIcon />} href="#/timeline">
          Timeline
        </SideNavItem>
      </SideNavGroup>
      <SideNavGroup label="Configure">
        <SideNavItem icon={<SettingsIcon />} href="#/settings">
          Settings
        </SideNavItem>
      </SideNavGroup>
    </SideNav>
  )
}

// Stand-in for your router's <Link>. Like a real one, it passes the props it is given (className, aria-current) on to its <a>.
const Link = ({ to, ...rest }: ComponentPropsWithRef<'a'> & { to: string }) => <a href={to} {...rest} />

/** With a router, use asChild so the router link keeps its navigation and gets the icon, label and count. */
export function RouterLinks() {
  return (
    <div className="w-60">
      <SideNav aria-label="Main">
        <SideNavGroup label="Monitor">
          <SideNavItem asChild icon={<GridIcon />} active>
            <Link to="#/station">Station</Link>
          </SideNavItem>
          <SideNavItem asChild icon={<PulseIcon />} badge={{ severity: 'advisory', count: 4 }}>
            <Link to="#/services">Services</Link>
          </SideNavItem>
        </SideNavGroup>
      </SideNav>
    </div>
  )
}

/** An item with no href is a button, for something that runs an action instead of going to a page. */
export function ActionItem() {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-60">
      <SideNav aria-label="Main">
        <SideNavGroup label="Account">
          <SideNavItem icon={<UserIcon />} href="#/profile">
            Profile
          </SideNavItem>
          <SideNavItem icon={<SettingsIcon />} onClick={() => setOpen((o) => !o)}>
            Preferences
          </SideNavItem>
        </SideNavGroup>
      </SideNav>
      <p className="mt-3 px-2.5 text-xs text-fg-muted">Preferences are {open ? 'open' : 'closed'}.</p>
    </div>
  )
}
