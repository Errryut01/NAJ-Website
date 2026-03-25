export type NavItem = { id: string; label: string; href: string }

/** Home page anchors — labels match current homepage sections */
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'candidates', label: 'Testimonials', href: '#candidates' },
  { id: 'veterans', label: 'The cost of waiting', href: '#veterans' },
  { id: 'team', label: 'Your first week', href: '#team' },
  { id: 'employers-cta', label: 'Hiring managers', href: '#employers-cta' },
  { id: 'contact', label: 'Contact', href: '#contact' },
]

/** Nav links for /employers — same labels, hash hrefs prefixed for cross-route navigation */
export const EMPLOYERS_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  ...DEFAULT_NAV_ITEMS.filter((i) => i.id !== 'home').map((item) => ({
    ...item,
    href: item.href.startsWith('#') ? `/${item.href}` : item.href,
  })),
  { id: 'employers-page', label: 'Employer services', href: '/employers' },
]
