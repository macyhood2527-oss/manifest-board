import { useEffect, useState } from 'react'
import {
  NotebookText,
  ChevronLeft,
  CircleCheckBig,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  Smartphone,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import topIcon from '../assets/top-icon.png'
import { useBoards } from '../boards/useBoards'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useAuth } from '../context/useAuth'
import { ui } from '../lib/ui'

const SIDEBAR_STATE_KEY = 'manifest-board-sidebar-collapsed'

const navigationGroups = [
  {
    key: 'browse',
    label: 'Browse',
    items: [
      { to: '/', label: 'Board', end: true, icon: LayoutGrid },
      { to: '/achieved', label: 'Achieved', icon: CircleCheckBig },
      { to: '/quotes', label: 'Quotes', icon: NotebookText },
    ],
  },
  {
    key: 'manage',
    label: 'Manage',
    items: [
      { to: '/manifests/new', label: 'Add Dream', icon: Plus },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function getUserMarker(user) {
  if (user?.name?.trim()) {
    return user.name.trim().charAt(0).toUpperCase()
  }

  if (user?.email?.trim()) {
    return user.email.trim().charAt(0).toUpperCase()
  }

  return 'M'
}

function getSidebarLinkClasses(isActive, isCollapsed) {
  return [
    'group relative flex items-center gap-3 rounded-2xl text-sm font-medium transition duration-200',
    isCollapsed ? 'justify-center px-0 py-0' : 'px-3 py-2.5',
    isActive
      ? 'bg-[color-mix(in_srgb,var(--color-primary)_9%,white)] text-[var(--color-heading)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))]'
      : 'text-[var(--color-text-soft)] hover:bg-[color-mix(in_srgb,var(--color-surface-soft)_88%,white)] hover:text-[var(--color-heading)]',
  ].join(' ')
}

function SidebarNavItem({ item, isCollapsed, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) => getSidebarLinkClasses(isActive, isCollapsed)}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'relative inline-flex shrink-0 items-center justify-center rounded-xl transition duration-200',
              isCollapsed ? 'h-10 w-10' : 'h-9 w-9',
              isActive
                ? 'bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] text-[var(--color-primary)]'
                : 'bg-transparent text-current group-hover:bg-[var(--color-surface-elevated)]',
            ].join(' ')}
            aria-hidden="true"
          >
            <item.icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.9} />
          </span>
          {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
          {isCollapsed ? (
            <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-heading)] shadow-paper group-hover:block group-focus-visible:block">
              {item.label}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

function SidebarNav({ isCollapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-4">
      {navigationGroups.map((group, index) => (
        <div
          key={group.key}
          className={index > 0 ? 'border-t border-[var(--color-border)]/70 pt-4' : ''}
        >
          {!isCollapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]/85">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function SidebarBrand({ isCollapsed, onToggle }) {
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-contrast)] shadow-sm transition duration-200 hover:bg-[var(--color-primary-hover)]"
        aria-label="Expand sidebar"
      >
        <span className="transition duration-200 group-hover:-translate-x-2 group-hover:opacity-0">
          <img
            src={topIcon}
            alt=""
            className="h-[1.2rem] w-[1.2rem] object-contain"
          />
        </span>
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100">
          <ChevronLeft className="h-4 w-4 rotate-180" strokeWidth={2} />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full items-start justify-between rounded-2xl px-2 py-2 text-left transition duration-200 hover:bg-[color-mix(in_srgb,var(--color-bg-soft)_88%,white)]"
      aria-label="Collapse sidebar"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
          Pinned intentions
        </p>
        <h1 className="mt-1 truncate font-serif text-[2rem] leading-none text-[var(--color-heading)]">
          Manifest Board
        </h1>
      </div>
      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-soft)] opacity-0 transition duration-200 group-hover:bg-[var(--color-surface-elevated)] group-hover:text-[var(--color-heading)] group-hover:opacity-100">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
      </span>
    </button>
  )
}

function SidebarBoardCover({ isCollapsed = false }) {
  const { selectedBoard } = useBoards()

  if (!selectedBoard) {
    return null
  }

  if (isCollapsed) {
    return (
      <div className="flex w-full justify-center">
        <div className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_88%,white)] shadow-sm">
          {selectedBoard.coverImageUrl ? (
            <img
              src={selectedBoard.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_16%,white),color-mix(in_srgb,var(--color-accent)_14%,white))] text-base leading-none text-[var(--color-heading)]">
              {selectedBoard.emoji || '✨'}
            </div>
          )}

          <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-heading)] shadow-paper group-hover:block">
            {selectedBoard.name || 'Current board'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_88%,white)] shadow-sm">
      <div className="relative aspect-[16/8]">
        {selectedBoard.coverImageUrl ? (
          <img
            src={selectedBoard.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_16%,white),color-mix(in_srgb,var(--color-accent)_14%,white))] text-4xl">
            {selectedBoard.emoji || '✨'}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/20 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-3 py-3 text-[var(--color-primary-contrast)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Current board
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {selectedBoard.name || 'Manifest Board'}
          </p>
        </div>
      </div>
    </section>
  )
}

function SidebarAccountSection({ isCollapsed, onLogout, canInstall, onInstall }) {
  const { user } = useAuth()

  if (isCollapsed) {
    return (
      <div className="flex w-full justify-center border-t border-[var(--color-border)]/70 pt-4">
        <button
          type="button"
          onClick={onLogout}
          title={user?.email || 'Sign out'}
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] transition duration-200 hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.9} />
          <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-heading)] shadow-paper group-hover:block">
            Sign out
          </span>
        </button>
      </div>
    )
  }

  return (
    <section className="w-full overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-3.5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_14%,white)] text-sm font-semibold text-[var(--color-primary)] shadow-sm">
          {getUserMarker(user)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]/85">
            Your account
          </p>
          <p className="mt-1 truncate text-sm font-medium text-[var(--color-heading)]">
            {user?.name || 'Manifest Board user'}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--color-text-soft)]">
            {user?.email || 'No email available'}
          </p>
        </div>
      </div>

      <div className="mt-3.5 space-y-2">
        {canInstall ? (
          <button type="button" onClick={onInstall} className={`${ui.buttonPrimary} w-full px-3 py-2.5 text-xs`}>
            <Smartphone className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.9} />
            Install app
          </button>
        ) : null}
        <button type="button" onClick={onLogout} className={`${ui.buttonSecondary} w-full px-3 py-2.5 text-xs`}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.9} />
          Sign out
        </button>
      </div>
    </section>
  )
}

function DesktopSidebar({ isCollapsed, setIsCollapsed, onMobileClose }) {
  const { logout } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 lg:flex',
        isCollapsed ? 'w-16' : 'w-[16.25rem]',
      ].join(' ')}
    >
      <div className="flex w-full py-2 pr-2">
        <div
          className={[
            `${ui.panelStrong} flex min-h-0 flex-1 flex-col rounded-l-none border-l-0`,
            isCollapsed ? 'items-center px-2 py-3.5' : 'px-3 py-4.5',
          ].join(' ')}
        >
          <SidebarBrand
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((currentValue) => !currentValue)}
          />

          <div
            className={[
              'mt-4 flex min-h-0 flex-1 flex-col',
              isCollapsed ? 'w-full items-center gap-4' : 'gap-4',
            ].join(' ')}
          >
            <div className={['flex min-h-0 flex-1 flex-col', isCollapsed ? 'w-full items-center overflow-y-auto' : 'overflow-y-auto pr-1'].join(' ')}>
              <SidebarBoardCover isCollapsed={isCollapsed} />
              <div className={isCollapsed ? 'mt-5 w-full' : 'mt-4'}>
                <SidebarNav isCollapsed={isCollapsed} />
              </div>
            </div>
            <div className="w-full border-t border-[var(--color-border)]/0 pt-1">
              <SidebarAccountSection
                isCollapsed={isCollapsed}
                onLogout={logout}
                canInstall={canInstall}
                onInstall={promptInstall}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function MobileSidebar({ isOpen, onClose }) {
  const { selectedBoard } = useBoards()
  const { logout } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close navigation"
      />

      <aside className={`${ui.panelStrong} absolute inset-y-3 left-3 flex w-[min(88vw,20rem)] max-w-[20rem] flex-col overflow-hidden px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Pinned intentions
            </p>
            <h2 className="mt-1 truncate font-serif text-3xl text-[var(--color-heading)]">
              {selectedBoard?.name || 'Manifest Board'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-lg text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-surface-elevated)]"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
          <SidebarBoardCover />
          <SidebarNav isCollapsed={false} onNavigate={onClose} />
          <div className="mt-auto">
            <SidebarAccountSection
              isCollapsed={false}
              canInstall={canInstall}
              onInstall={async () => {
                await promptInstall()
                onClose()
              }}
              onLogout={() => {
                logout()
                onClose()
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}

export function AppShell({ children }) {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_STATE_KEY) === 'true'
  })
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STATE_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      document.body.style.overflow = ''
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileSidebarOpen])

  return (
    <main className={ui.pageShell}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-4rem] h-56 w-56 rounded-full bg-rose-200/35 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute right-[-6rem] top-20 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-10 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-violet-200/20 blur-3xl sm:h-80 sm:w-80" />
      </div>

      <DesktopSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={[
          'flex min-h-[calc(100vh-1rem)] w-full max-w-none transition-[padding] duration-300 sm:min-h-[calc(100vh-2rem)]',
          isSidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-[17.5rem]',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5">
          <header className={`${ui.panel} sticky top-2 z-20 flex items-center justify-between gap-3 px-4 py-3.5 lg:hidden`}>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
                Pinned intentions
              </p>
              <h1 className="mt-1 truncate font-serif text-2xl text-[var(--color-heading)]">
                Manifest Board
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-lg text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-surface-elevated)]"
              aria-label="Open navigation"
            >
              ☰
            </button>
          </header>

          <div className={ui.pageContainer}>
            {children}
          </div>

          <footer className="px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 sm:px-1 sm:pb-1">
            <div className="rounded-[1.35rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_88%,white)] px-4 py-3 shadow-sm">
              <p className="text-center text-xs font-medium tracking-[0.04em] text-[var(--color-text-soft)]">
                Built by <span className="text-[var(--color-heading)]">Melissa Marcelo 🌿</span>
              </p>
              <p className="mt-1 text-center text-[11px] text-[var(--color-text-soft)]/85">
                "Small steps still shape beautiful futures."
              </p>
            </div>
          </footer>
        </div>
      </div>

      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
    </main>
  )
}
