import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  CircleCheckBig,
  FolderHeart,
  Heart,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
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

function getBoardMarker(board) {
  if (board?.coverImageUrl) {
    return (
      <img
        src={board.coverImageUrl}
        alt=""
        className="h-full w-full rounded-[inherit] object-cover"
      />
    )
  }

  if (board?.emoji) {
    return board.emoji
  }

  return board?.name?.trim()?.charAt(0)?.toUpperCase() || 'M'
}

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
        <div key={group.key} className={index > 0 ? 'border-t border-[var(--color-border)]/70 pt-4' : ''}>
          {!isCollapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]/85">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-1.5">
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
          <Heart className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
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
      className="group flex w-full items-start justify-between rounded-2xl px-1 py-1 text-left transition duration-200 hover:bg-[color-mix(in_srgb,var(--color-bg-soft)_88%,white)]"
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

function SidebarBoardSection({ isCollapsed, onNavigate }) {
  const { boards, selectedBoardId, selectedBoard, selectBoard, isLoadingBoards } = useBoards()

  if (isCollapsed) {
    return (
      <div className="flex w-full justify-center border-b border-[var(--color-border)]/70 pb-4">
        <button
          type="button"
          onClick={onNavigate}
          title={selectedBoard?.name || 'Current board'}
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-primary)] transition duration-200 hover:bg-[var(--color-surface-elevated)]"
        >
          <span className="inline-flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] text-base leading-none">
            {getBoardMarker(selectedBoard)}
          </span>
          <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--color-heading)] shadow-paper group-hover:block">
            {selectedBoard?.name || 'Current board'}
          </span>
        </button>
      </div>
    )
  }

  return (
    <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]/85">
        <FolderHeart className="h-3.5 w-3.5 text-[var(--color-primary)]" strokeWidth={1.9} />
        Board
      </div>

      <label className="mt-2 block">
        <select
          value={selectedBoardId}
          onChange={(event) => {
            selectBoard(event.target.value)
            onNavigate?.()
          }}
          disabled={isLoadingBoards}
          className={`${ui.fieldInput} py-3 pr-10`}
        >
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.emoji ? `${board.emoji} ${board.name}` : board.name}
            </option>
          ))}
        </select>
      </label>

      {selectedBoard?.coverImageUrl ? (
        <div className="mt-3 overflow-hidden rounded-[1.15rem] border border-[var(--color-border)] bg-[var(--color-paper-strong)]">
          <img
            src={selectedBoard.coverImageUrl}
            alt=""
            className="aspect-[16/8] w-full object-cover"
          />
        </div>
      ) : null}
    </section>
  )
}

function SidebarAccountSection({ isCollapsed, onLogout }) {
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
    <section className="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3">
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

      <div className="mt-3">
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

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 lg:flex',
        isCollapsed ? 'w-16' : 'w-[15rem]',
      ].join(' ')}
    >
      <div className="flex w-full py-2 pr-2">
        <div
          className={[
            `${ui.panelStrong} flex flex-1 flex-col rounded-l-none border-l-0`,
            isCollapsed ? 'items-center px-2 py-3' : 'px-3 py-4',
          ].join(' ')}
        >
          <SidebarBrand
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((currentValue) => !currentValue)}
          />

          <div className={['mt-4 flex flex-1 flex-col', isCollapsed ? 'w-full items-center gap-4' : 'gap-4'].join(' ')}>
            <SidebarBoardSection isCollapsed={isCollapsed} onNavigate={onMobileClose} />
            <div className={isCollapsed ? 'w-full' : ''}>
              <SidebarNav isCollapsed={isCollapsed} />
            </div>
            <div className="mt-auto w-full">
              <SidebarAccountSection
                isCollapsed={isCollapsed}
                onLogout={logout}
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

      <aside className={`${ui.panelStrong} absolute inset-y-3 left-3 flex w-[min(84vw,20rem)] flex-col overflow-hidden px-4 py-5`}>
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

        <div className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
          <SidebarBoardSection isCollapsed={false} onNavigate={onClose} />
          <SidebarNav isCollapsed={false} onNavigate={onClose} />
          <div className="mt-auto">
            <SidebarAccountSection
              isCollapsed={false}
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
          isSidebarCollapsed ? 'lg:pl-[4.25rem]' : 'lg:pl-[15.4rem]',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5">
          <header className={`${ui.panel} flex items-center justify-between gap-3 px-4 py-3.5 lg:hidden`}>
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
        </div>
      </div>

      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
    </main>
  )
}
