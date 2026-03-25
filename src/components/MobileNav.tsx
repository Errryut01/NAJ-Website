'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const CALENDAR_BOOK_URL = 'https://calendar.app.google/ca4jkCKsquRVsndB7'

/** Home page anchors — labels match current homepage sections */
export const DEFAULT_NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'candidates', label: 'Testimonials', href: '#candidates' },
  { id: 'veterans', label: 'The cost of waiting', href: '#veterans' },
  { id: 'team', label: 'Your first week', href: '#team' },
  { id: 'employers-cta', label: 'Hiring managers', href: '#employers-cta' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

type NavItem = { id: string; label: string; href: string }

export default function MobileNav({ navItems = DEFAULT_NAV_ITEMS }: { navItems?: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c071a]/90 backdrop-blur">
      <div className="relative mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
        <Link
          href={
            navItems[0]?.href?.startsWith('#')
              ? `/${navItems[0].href}`
              : (navItems[0]?.href ?? '/')
          }
          className="z-10 shrink-0 text-lg font-bold tracking-tight text-amber-400 transition-colors hover:text-amber-300"
        >
          NAJ
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden max-w-[min(100%,42rem)] -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm font-semibold text-slate-200 lg:gap-x-6 lg:text-[0.9375rem] md:flex">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="whitespace-nowrap hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="z-10 flex shrink-0 items-center gap-1.5 sm:gap-3">
          <a
            href={CALENDAR_BOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-amber-400 px-2.5 py-2 text-center text-[0.7rem] font-semibold leading-snug text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300 sm:px-4 sm:text-sm sm:leading-tight"
          >
            Book Your Free Strategy Call
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-200 hover:text-white md:hidden"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <nav
            className="absolute top-full left-0 right-0 border-b border-white/10 bg-[#0c071a] md:hidden"
            aria-hidden={!isOpen}
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={CALENDAR_BOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="mt-2 block rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-center text-sm font-semibold text-amber-300"
              >
                Book Your Free Strategy Call
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
