import Image from 'next/image'
import { CandidateIntakeForm } from '@/components/CandidateIntakeForm'
import { ContactForm } from '@/components/ContactForm'
import MobileNav from '@/components/MobileNav'

export default function Home() {
  return (
    <div className="naj-wallpaper min-h-screen min-w-0 overflow-x-hidden bg-[#0c071a] text-slate-100">
      <MobileNav />

      <main>
        <section id="home" className="bg-gradient-to-br from-[#0c071a] via-[#140a26] to-[#0c071a]">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="grid w-full min-w-0 gap-12 lg:grid-cols-1">
              <div className="min-w-0 space-y-6">
                <div className="flex justify-center sm:justify-start">
                  <div className="relative h-[12rem] w-[12rem] shrink-0 sm:h-[16rem] sm:w-[16rem]">
                    <Image src="/naj-logo-2026-v2.png" alt="NAJ logo" fill className="object-contain" />
                  </div>
                </div>
                <div className="mb-32 mt-8 flex flex-col items-center text-center sm:mb-48 sm:mt-12">
                  <span className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-[3.75rem] font-semibold tracking-wide text-transparent sm:text-[6rem] md:text-[7.125rem] lg:text-[9.375rem]">Network</span>
                  <span className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-[3.75rem] font-semibold tracking-wide text-transparent sm:text-[6rem] md:text-[7.125rem] lg:text-[9.375rem]">Ferociously</span>
                </div>
                <div className="space-y-10">
                  <p className="max-w-full break-words text-center text-base font-semibold uppercase tracking-[0.15em] text-amber-300 sm:text-lg sm:tracking-[0.25em] lg:tracking-[0.3em]">
                    NAJ is a Veteran and Minority Owned Business
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        title: 'For Candidates',
                        description: 'Build your Tech sales story, sharpen your pitch, and get connected to hiring managers looking for hungry, coachable talent. We will develop a plan using our proven method to address your skill gap and help you land the role you want.',
                        href: '#candidates',
                        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                      },
                      {
                        title: 'For Transitioning Military',
                        description: 'Translate military leadership into high-impact Tech sales careers. We help veterans map their experience to Tech sales roles. We will develop a plan using our proven method to address your skill gap and help you land the role you want.',
                        href: '#veterans',
                        image: '/transitioning-military.png',
                      },
                      {
                        title: 'For Employers',
                        description: 'Build revenue teams with proven GTM talent. We design roles, source top candidates, and close hires that accelerate pipeline.',
                        href: '/employers',
                        image: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=800&q=80',
                      },
                    ].map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="mb-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                          <p className="mb-4 flex-1 text-sm text-slate-600">{item.description}</p>
                          <span className="text-sm font-medium text-amber-600 underline decoration-amber-600/50 underline-offset-2 group-hover:text-amber-500">
                            Learn More
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <p className="mt-10 max-w-full break-words text-center text-sm font-semibold uppercase tracking-[0.15em] text-amber-300 sm:text-base sm:tracking-[0.25em] lg:tracking-[0.3em]">
                    Our mentees have launched careers at top tech companies
                  </p>
                  <div className="grid w-full min-w-0 grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/90 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                    {[
                      { label: 'Amazon Web Services', type: 'logo', src: '/logo-aws.png', className: 'h-[10.5rem] w-auto max-w-[15rem] sm:h-40 sm:max-w-[26rem]' },
                      { label: 'Couchbase', type: 'logo', src: '/logo-couchbase.png', className: 'h-[9rem] w-auto max-w-[12rem] sm:h-36 sm:max-w-[24rem]' },
                      { label: 'Dell', type: 'logo', src: '/logo-dell.png', className: 'h-[7.5rem] w-auto max-w-[10.5rem] sm:h-32 sm:max-w-[20rem]' },
                      { label: 'Cisco', type: 'logo', src: '/logo-cisco-v3.png', className: 'h-[9rem] w-auto max-w-[13.5rem] sm:h-36 sm:max-w-[28rem]' },
                      { label: 'Fortinet', type: 'logo', src: '/logo-fortinet.png', className: 'h-[9rem] w-auto max-w-[13.5rem] sm:h-36 sm:max-w-[28rem]' },
                      { label: 'NetApp', type: 'logo', src: '/logo-netapp.png', className: 'h-[7.5rem] w-auto max-w-[10.5rem] sm:h-32 sm:max-w-[20rem]' },
                      { label: 'Oracle', type: 'logo', src: '/logo-oracle.png', className: 'h-[7.5rem] w-auto max-w-[21rem] object-contain sm:h-28 sm:max-w-[22rem]' },
                      { label: 'mongoDB', type: 'logo', src: '/logo-mongodb.png', className: 'h-[9rem] w-auto max-w-[12rem] sm:h-36 sm:max-w-[24rem]' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex w-full min-w-0 items-center justify-center rounded-xl border border-transparent bg-transparent px-4 py-8 text-center text-sm font-semibold text-slate-900 sm:py-10"
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
                  Break into Tech sales with coaching, strategy, and a proven playbook.
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
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="space-y-4 lg:pr-6">
                <h2 className="text-3xl font-semibold tracking-tight">For Candidates</h2>
                <p className="text-slate-300">
                  Build your Tech sales story, sharpen your pitch, and get connected to hiring managers
                  looking for hungry, coachable talent. Develop and use the skills required for these positions.
                  Show the hiring manager you will provide value on day one.
                </p>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f081d] to-amber-900/20 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-100">Common Tech Sales Titles</h3>
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
                  Share your LinkedIn profile and we will map out a plan to break into Tech sales.
                </p>
                <CandidateIntakeForm />
              </div>
            </div>
          </div>
        </section>

        <section id="veterans" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-base font-semibold uppercase tracking-[0.25em] text-amber-300">
                  For Transitioning Veterans
                </p>
                <h2 className="text-4xl font-semibold tracking-tight">
                  Translate military leadership into high-impact Tech sales careers.
                </h2>
                <p className="text-lg text-slate-300">
                  We help veterans map their experience to Tech sales roles, build a compelling story, and practice the
                  skills needed to win interviews and succeed on day one. Our approach includes identifying your
                  marketable skills, translating your military experience into language hiring managers understand,
                  selecting positions that align with your skills, credentials, and experience, and developing the sales
                  skills required for these roles.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#140a26]/70 p-7 text-base text-slate-300 shadow-sm">
                <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube-nocookie.com/embed/PBs7rsN58LI?rel=0"
                    title="For Transitioning Veterans"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-100">Veteran Intake</h3>
                <p className="mb-4 text-sm text-slate-300">
                  Share your LinkedIn profile and we will map out a plan to transition into Tech sales.
                </p>
                <CandidateIntakeForm formType="Veteran Intake" />
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="space-y-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">About the Team</p>
              <h2 className="text-3xl font-semibold tracking-tight">People first recruiting and coaching with domain expertise.</h2>
              <p className="mx-auto max-w-3xl text-left text-slate-300">
                Our coaching is built on over 20 years of GTM tech sales experience—from individual contributor roles through leadership. We offer personalized career strategy, interview preparation, and hands-on skill development tailored to each candidate&apos;s goals. For organizations looking to staff GTM roles, this depth of experience means we understand what success looks like in the field: we can identify candidates who will ramp quickly, build pipeline, and close business. We blend GTM hiring expertise with a hands-on, high-touch approach to recruiting and coaching.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
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
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-400 sm:px-6 md:flex-row">
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