'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const DEFAULT_NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'employers', label: 'For Employers', href: '/employers' },
  { id: 'candidates', label: 'For Candidates', href: '#candidates' },
  { id: 'veterans', label: 'For Transitioning Veterans', href: '#veterans' },
  { id: 'team', label: 'About/Team', href: '#team' },
  { id: 'contact', label: 'Contact/Action', href: '#contact' },
]

type NavItem = { id: string; label: string; href: string }

export default function MobileNav({ navItems = DEFAULT_NAV_ITEMS }: { navItems?: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c071a]/90 backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-4 sm:px-6">
        {/* Desktop nav - hidden on mobile, centered */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-200 sm:gap-6">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button - absolute right on small screens */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-200 hover:text-white"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile nav - full width when open */}
        {isOpen && (
          <nav
            className="absolute top-full left-0 right-0 bg-[#0c071a] border-b border-white/10 md:hidden"
            aria-hidden={!isOpen}
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  className="block py-3 px-4 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
