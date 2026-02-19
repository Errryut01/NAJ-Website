import Image from 'next/image'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const EMPLOYERS_NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'employers', label: 'For Employers', href: '/employers' },
  { id: 'candidates', label: 'For Candidates', href: '/#candidates' },
  { id: 'team', label: 'About/Team', href: '/#team' },
  { id: 'contact', label: 'Contact/Action', href: '/#contact' },
]

export default function EmployersPage() {
  return (
    <div className="naj-wallpaper min-h-screen min-w-0 overflow-x-hidden bg-[#0c071a] text-slate-100">
      <MobileNav navItems={EMPLOYERS_NAV_ITEMS} />

      <main>
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
          <p className="text-center text-lg font-semibold uppercase tracking-[0.3em] text-amber-300 sm:text-xl">
            NAJ is a Veteran and Minority Owned Business
          </p>
        </div>
        <section className="bg-gradient-to-br from-[#0c071a] via-[#140a26] to-[#0c071a]">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Employer Services</p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-100 lg:text-5xl">
                  Build revenue teams with proven GTM talent.
                </h1>
                <p className="text-lg text-slate-300">
                  NAJ partners with growth-stage companies to design roles, source top candidates, and close hires
                  that accelerate pipeline and revenue impact.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/#contact"
                    className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-[#0c071a] shadow-sm hover:bg-amber-300"
                  >
                    Start an Employer Search
                  </Link>
                  <Link
                    href="/#team"
                    className="rounded-md border border-amber-300/60 px-5 py-3 text-sm font-semibold text-amber-100 hover:border-amber-200"
                  >
                    Meet the Team
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-400/20 bg-[#120a22]/80 p-4 shadow-xl shadow-amber-900/30 sm:p-6">
                <img
                  src="https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=900&q=80"
                  alt="Professional meeting with hiring leaders"
                  className="h-[26rem] w-full rounded-2xl object-cover sm:h-[30rem]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight">How We Support Employers</h2>
                <p className="text-slate-300">
                  We act as an extension of your leadership team. From role design through close, our process
                  is transparent, data-informed, and built around candidate experience.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
                {[
                  { title: 'Search Strategy', text: 'Role calibration, comp benchmarking, and outreach strategy.' },
                  { title: 'Sourcing Engine', text: 'Targeted outbound sourcing plus curated talent pipelines.' },
                  { title: 'Screening & Scorecards', text: 'Structured interviews, skill assessments, and slate delivery.' },
                  { title: 'Offer & Close', text: 'Negotiation support, reference checks, and onboarding handoff.' },
                ].map((card) => (
                  <div key={card.title} className="rounded-xl border border-white/10 bg-[#140a26]/70 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-100">{card.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
