import Image from 'next/image'
import Link from 'next/link'
import { CandidateIntakeForm } from '@/components/CandidateIntakeForm'
import { ContactForm } from '@/components/ContactForm'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'employers', label: 'For Employers', href: '/employers' },
  { id: 'candidates', label: 'For Candidates', href: '#candidates' },
  { id: 'veterans', label: 'For Transitioning Veterans', href: '#veterans' },
  { id: 'team', label: 'About/Team', href: '#team' },
  { id: 'contact', label: 'Contact/Action', href: '#contact' },
]

export default function Home() {
  return (
    <div className="naj-wallpaper min-h-screen bg-[#0c071a] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c071a]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-4 sm:px-6">
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-200 sm:gap-6">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="bg-gradient-to-br from-[#0c071a] via-[#140a26] to-[#0c071a]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-1">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="relative h-[12rem] w-[12rem] sm:h-[16rem] sm:w-[16rem]">
                    <Image src="/naj-logo-2026-v2.png" alt="NAJ logo" fill className="object-contain" />
                  </div>
                </div>
                <div className="text-center text-amber-300 mb-48 mt-12">
                  <p className="whitespace-nowrap text-5xl font-semibold tracking-wide sm:text-6xl lg:text-7xl">
                    Network Ferociously
                  </p>
                </div>
                <div className="space-y-10">
                  <p className="text-center text-lg font-semibold uppercase tracking-[0.3em] text-amber-300 sm:text-xl">
                    NAJ is a Veteran and Minority Owned Business
                  </p>
                  <div className="h-8"></div>
                  <p className="mt-10 text-center text-base font-semibold uppercase tracking-[0.3em] text-amber-300 sm:text-lg">
                    Our mentees have launched careers at top tech companies
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-white/10 bg-white/90 p-6">
                    {[
                      { label: 'Amazon Web Services', type: 'logo', src: '/logo-aws.png', className: 'h-40 w-auto max-w-[26rem]' },
                      { label: 'Couchbase', type: 'logo', src: '/logo-couchbase.png', className: 'h-36 w-auto max-w-[24rem]' },
                      { label: 'Dell', type: 'logo', src: '/logo-dell.png', className: 'h-32 w-auto max-w-[20rem]' },
                      { label: 'Cisco', type: 'logo', src: '/logo-cisco-v3.png', className: 'h-36 w-auto max-w-[28rem]' },
                      { label: 'Fortinet', type: 'logo', src: '/logo-fortinet.png', className: 'h-36 w-auto max-w-[28rem]' },
                      { label: 'NetApp', type: 'logo', src: '/logo-netapp.png', className: 'h-32 w-auto max-w-[20rem]' },
                      { label: 'Oracle', type: 'logo', src: '/logo-oracle.png', className: 'h-28 w-auto max-w-[22rem]' },
                      { label: 'mongoDB', type: 'logo', src: '/logo-mongodb.png', className: 'h-36 w-auto max-w-[24rem]' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-center rounded-xl border border-transparent bg-transparent px-4 py-10 text-center text-sm font-semibold text-slate-900"
                      >
                        {item.type === 'logo' ? (
                          <img src={item.src} alt={`${item.label} logo`} className={item.className} />
                        ) : (
                          item.label
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-24 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Candidate Career Partner</p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-100 lg:text-5xl">
                  Break into SaaS &amp; Tech sales with coaching, strategy, and a proven playbook.
                </h1>
                <p className="text-lg text-slate-300">
                  NAJ helps candidates pivot into high-growth sales roles through personalized coaching,
                  interview prep, and targeted outreach. We guide you from first conversation to offer.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#contact"
                    className="rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-[#0c071a] shadow-sm hover:bg-amber-300"
                  >
                  Start Your Plan
                  </a>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="candidates" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-7xl px-6 py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="space-y-4 lg:pr-6">
                <h2 className="text-3xl font-semibold tracking-tight">For Candidates</h2>
                <p className="text-slate-300">
                  Build your SaaS sales story, sharpen your pitch, and get connected to hiring managers
                  looking for hungry, coachable talent. Develop and use the skills required for these positions.
                  Show the hiring manager you will provide value on day one.
                </p>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f081d] to-amber-900/20 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-100">Common SaaS Sales Titles</h3>
                  <div className="mt-6 space-y-5">
                    {[
                      {
                        title: 'Sales Development Representative (SDR) / Business Development Representative (BDR)',
                        definition: 'Entry-level role focused on lead generation, outreach, and booking meetings.',
                        base: 'Base Salary: $55,000 – $75,000 (median around $60,000)',
                        ote: 'OTE: $70,000 – $100,000 (often $85,000 median)',
                        note: 'Top performers can reach $120,000+.',
                        skillsLabel: 'Skills We Will Develop and Practice',
                        skills: [
                          'Identifying your Ideal Customer Profile',
                          'Account Research',
                          'Informational Interviewing',
                          'Social Media',
                          'Proactive Outreach',
                          'Interviewing',
                          'Relentless Networking',
                        ],
                      },
                      {
                        title: 'SMB/Mid-Market Account Executive (AE)',
                        definition: 'Core closer role for smaller deals with faster sales cycles.',
                        base: 'Base Salary: $70,000 – $100,000',
                        ote: 'OTE: $110,000 – $200,000 (common $130,000–$180,000)',
                        note: 'Overall AE medians: Base ~$90,000–$110,000; OTE ~$150,000–$200,000.',
                        skillsLabel: 'Skills We Will Develop and Practice',
                        skills: [
                          'Consultative/Value Based Selling',
                          'Negotiation',
                          'Executive Presence',
                          'Stakeholder Management',
                          'Mock Call Prep',
                          'Pipeline and Forecast Accuracy',
                          'Relentless Networking',
                        ],
                      },
                      {
                        title: 'Enterprise/Strategic Account Executive (AE)',
                        definition: 'Closes large, complex deals with multiple stakeholders and long cycles.',
                        base: 'Base Salary: $100,000 – $150,000+',
                        ote: 'OTE: $180,000 – $320,000+ (median often $190,000–$250,000)',
                        note: 'Top earners $300,000–$400,000+ with accelerators.',
                        skillsLabel: 'Skills We Will Develop and Practice',
                        skills: [
                          'Consultative/Value Based Selling',
                          'Negotiation',
                          'Executive Presence',
                          'Stakeholder Management',
                          'Mock Call Prep',
                          'Pipeline and Forecast Accuracy',
                          'Multi-threaded Selling',
                          'Relentless Networking',
                        ],
                      },
                    ].map((role) => (
                      <div key={role.title} className="rounded-xl border border-white/10 bg-[#140a26]/70 p-4 shadow-sm">
                        <p className="text-sm font-semibold text-slate-100">{role.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{role.definition}</p>
                        <div className="mt-3 space-y-2 text-xs text-slate-200">
                          <div className="rounded-lg bg-amber-400/15 px-3 py-2 text-amber-100/90">{role.base}</div>
                          <div className="rounded-lg bg-amber-400/15 px-3 py-2 text-amber-100/90">{role.ote}</div>
                          <div className="rounded-lg bg-amber-500/25 px-3 py-2 text-amber-100/90">{role.note}</div>
                        </div>
                        {role.skills && role.skillsLabel && (
                          <div className="mt-4 rounded-lg bg-[#0f081d]/80 px-3 py-3 text-xs text-slate-200">
                            <p className="text-xs font-semibold text-slate-100">{role.skillsLabel}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {role.skills.map((skill: string) => (
                                <span key={skill} className="rounded-full bg-[#1c1030] px-3 py-1 text-amber-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f081d] to-amber-900/20 p-6 shadow-sm lg:ml-4">
                <h3 className="text-lg font-semibold text-slate-100">Candidate Intake</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Share your resume or LinkedIn profile and we will map out a plan to break into SaaS sales.
                </p>
                <CandidateIntakeForm />
              </div>
            </div>
          </div>
        </section>

        <section id="veterans" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-base font-semibold uppercase tracking-[0.25em] text-amber-300">
                  For Transitioning Veterans
                </p>
                <h2 className="text-4xl font-semibold tracking-tight">
                  Translate military leadership into high-impact SaaS sales careers.
                </h2>
                <p className="text-lg text-slate-300">
                  We help veterans map their experience to GTM roles, build a compelling story, and practice the
                  skills needed to win interviews and succeed on day one.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#140a26]/70 p-7 text-base text-slate-300 shadow-sm">
                <video
                  className="mb-6 h-56 w-full rounded-xl object-cover"
                  src="/veteran-transition.mp4"
                  poster="/veteran-transition-poster-v2.png"
                  controls
                  playsInline
                />
                <ul className="space-y-4">
                  <li>Identify Marketable Skills</li>
                  <li>Translate Your Military Experience</li>
                  <li>Select Positions That Align With Your Skills, Credentials, and Experience</li>
                  <li>Develop Sales Skills</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">About the Team</p>
              <h2 className="text-3xl font-semibold tracking-tight">People first recruiting and coaching with domain expertise.</h2>
              <p className="mx-auto max-w-2xl text-slate-300">
                We blend GTM hiring experience with a hands-on, high-touch search approach.
              </p>
            </div>
            <div className="mt-10 flex flex-col items-center gap-8">
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#140a26]/80 p-6 text-center shadow-lg shadow-amber-900/30">
                <div className="relative mx-auto h-56 w-44 overflow-hidden rounded-2xl bg-gradient-to-br from-[#140a26] to-amber-900/30">
                  <Image src="/brian-keilers.png" alt="Brian Keilers" fill className="object-cover" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-100">Brian Keilers</h3>
                <p className="text-sm text-amber-300">Mentor and Founder</p>
                <p className="mt-3 text-sm text-slate-300">
                  20+ years in SaaS and Tech Sales and Leadership
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <div className="mx-auto max-w-2xl">
              <div className="space-y-4 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">Contact / Action</h2>
                <p className="text-slate-300">
                  Ready to build your revenue team or explore your next role? Tell us where to start.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0f081d]/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 md:flex-row">
          <span>© 2026 NAJ. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="/employers" className="hover:text-white">Employers</a>
            <a href="#candidates" className="hover:text-white">Candidates</a>
          </div>
        </div>
      </footer>
    </div>
  )
}