import Image from 'next/image'
import { ContactForm } from '@/components/ContactForm'
import MobileNav from '@/components/MobileNav'

export const metadata = {
  title: "Tech Sales Recruiting & Career Coaching",
  description:
    "Break into Tech sales with personalized coaching from former hiring managers. SDR, BDR, and AE roles. One-on-one coaching, proven playbooks, and direct connections to hiring managers.",
  alternates: { canonical: "https://networkajob.io" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NAJ",
  url: "https://networkajob.io",
  description: "Tech sales recruiting and career coaching. Former hiring managers help candidates break into SDR, BDR, and AE roles.",
  foundingDate: "2024",
  areaServed: "United States",
  serviceType: ["Recruiting", "Career Coaching", "Sales Training"],
};

export default function Home() {
  return (
    <div className="naj-wallpaper min-h-screen min-w-0 overflow-x-hidden bg-[#0c071a] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                  <h1 className="max-w-4xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text px-4 text-3xl font-semibold leading-tight tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-6xl">
                    Get the high-paying tech sales career you want.
                  </h1>
                  <p className="mt-5 max-w-2xl px-4 text-sm italic leading-relaxed text-slate-300 sm:text-base md:text-lg">
                    Ambitious candidates and transitioning veterans land high-paying tech sales careers - with coaching,
                    strategy, and warm introductions.
                  </p>
                  <a
                    href="https://calendar.app.google/ca4jkCKsquRVsndB7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300"
                  >
                    Book your free strategy call
                  </a>
                  <p className="mt-48 max-w-full break-words text-center text-sm font-semibold uppercase tracking-[0.15em] text-amber-300 sm:text-base sm:tracking-[0.25em] lg:tracking-[0.3em]">
                    Our mentees have launched careers at top tech companies
                  </p>
                  <div className="mt-6 w-full min-w-0 max-w-6xl rounded-2xl border border-white/10 bg-white/90 p-4 sm:p-6">
                    <div className="naj-marquee sm:hidden">
                      <div className="naj-marquee-track w-max items-center">
                        {[
                          { label: 'Amazon Web Services', src: '/logo-aws.png' },
                          { label: 'Couchbase', src: '/logo-couchbase.png' },
                          { label: 'Dell', src: '/logo-dell.png' },
                          { label: 'Cisco', src: '/logo-cisco-v3.png' },
                          { label: 'Fortinet', src: '/logo-fortinet.png' },
                          { label: 'NetApp', src: '/logo-netapp.png' },
                          { label: 'Oracle', src: '/logo-oracle.png' },
                          { label: 'mongoDB', src: '/logo-mongodb.png' },
                          { label: 'Amazon Web Services', src: '/logo-aws.png' },
                          { label: 'Couchbase', src: '/logo-couchbase.png' },
                          { label: 'Dell', src: '/logo-dell.png' },
                          { label: 'Cisco', src: '/logo-cisco-v3.png' },
                          { label: 'Fortinet', src: '/logo-fortinet.png' },
                          { label: 'NetApp', src: '/logo-netapp.png' },
                          { label: 'Oracle', src: '/logo-oracle.png' },
                          { label: 'mongoDB', src: '/logo-mongodb.png' },
                        ].map((item, index) => (
                          <div key={`${item.label}-${index}`} className="flex h-28 w-44 shrink-0 items-center justify-center">
                            <img src={item.src} alt={`${item.label} logo`} className="max-h-20 w-auto max-w-full object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-4">
                      {[
                        { label: 'Amazon Web Services', src: '/logo-aws.png', className: 'h-[10.5rem] w-auto max-w-[15rem] sm:h-40 sm:max-w-[26rem]' },
                        { label: 'Couchbase', src: '/logo-couchbase.png', className: 'h-[9rem] w-auto max-w-[12rem] sm:h-36 sm:max-w-[24rem]' },
                        { label: 'Dell', src: '/logo-dell.png', className: 'h-[7.5rem] w-auto max-w-[10.5rem] sm:h-32 sm:max-w-[20rem]' },
                        { label: 'Cisco', src: '/logo-cisco-v3.png', className: 'h-[9rem] w-auto max-w-[13.5rem] sm:h-36 sm:max-w-[28rem]' },
                        { label: 'Fortinet', src: '/logo-fortinet.png', className: 'h-[9rem] w-auto max-w-[13.5rem] sm:h-36 sm:max-w-[28rem]' },
                        { label: 'NetApp', src: '/logo-netapp.png', className: 'h-[7.5rem] w-auto max-w-[10.5rem] sm:h-32 sm:max-w-[20rem]' },
                        { label: 'Oracle', src: '/logo-oracle.png', className: 'h-[7.5rem] w-auto max-w-[21rem] object-contain sm:h-28 sm:max-w-[22rem]' },
                        { label: 'mongoDB', src: '/logo-mongodb.png', className: 'h-[9rem] w-auto max-w-[12rem] sm:h-36 sm:max-w-[24rem]' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex w-full min-w-0 items-center justify-center rounded-xl border border-transparent bg-transparent px-4 py-8 text-center text-sm font-semibold text-slate-900 sm:py-10"
                        >
                          <img src={item.src} alt={`${item.label} logo`} className={`${item.className} object-contain`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-16 w-full max-w-6xl space-y-6 px-4 text-left sm:mt-20 sm:px-6">
                  <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
                    The transition is harder than it should be.
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Maybe you&apos;ve been sending applications into the void — qualified on paper, but never getting the call back.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Maybe you served your country, built real leadership skills, and now feel completely invisible to an industry that should be lining up to hire you.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Maybe you&apos;re already in tech sales but stuck — passed over for promotion, under-coached, underpaid, watching less capable people move up while you grind in place.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    The role is different for everyone. But the feeling is the same.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    <span className="font-bold text-slate-100">Frustration.</span> You&apos;ve done everything right and it&apos;s not working.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    <span className="font-bold text-slate-100">Disappointment.</span> The career you pictured hasn&apos;t materialized the way you expected.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    That nagging sense that you&apos;re one introduction, one conversation, one right move away — if you only knew what that move was.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Here&apos;s the truth: breaking into tech sales — or breaking through to the next level — isn&apos;t about working harder. It&apos;s about having the right map, the right preparation, and access to the right rooms.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Most people are trying to figure that out alone.
                  </p>
                  <p className="text-lg font-bold leading-relaxed text-amber-300 sm:text-xl">
                    That&apos;s the problem NAJ solves.
                  </p>
                </div>
                <div className="mx-auto mt-16 w-full max-w-6xl space-y-6 px-4 sm:mt-20 sm:px-6">
                  <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
                    NAJ was built for this exact moment in your career.
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Most recruiting firms have never sold software. Most career coaches have never carried a quota. Most
                    job boards don&apos;t know the difference between an SDR and an AE — let alone what it takes to become
                    one.
                  </p>
                  <p className="text-lg font-bold leading-relaxed text-amber-300">
                    NAJ is different.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    We&apos;re a team of tech sales insiders who have sat in the seats we&apos;re placing you into.
                    We&apos;ve carried quotas, built pipelines, managed enterprise accounts, and led sales development
                    teams at companies like Pure Storage, Hitachi Digital, and CDW. We know what top hiring managers look
                    for on day one — because we&apos;ve been those hiring managers.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    We built NAJ because the transition into tech sales shouldn&apos;t require luck, connections you
                    don&apos;t have, or years of trial and error. It should require the right guide.
                  </p>
                  <p className="text-lg font-bold leading-relaxed text-amber-300">
                    That&apos;s us.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-300">
                    We&apos;ve placed candidates into roles at Amazon, Cisco, Dell, Oracle, Fortinet, and more. We know
                    which companies are hiring, what they&apos;re actually looking for, and how to position you to win.
                  </p>
                  <p className="text-lg font-semibold leading-relaxed text-slate-100">
                    You bring the drive. We bring the playbook.
                  </p>
                  <a
                    href="https://calendar.app.google/ca4jkCKsquRVsndB7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300"
                  >
                    Book Your Free Strategy Call
                  </a>
                </div>
                <div className="mx-auto mt-24 w-full max-w-6xl space-y-8 px-4 sm:px-6">
                  <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
                    Three steps to your tech sales career.
                  </h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 sm:text-xl">Step 1 — Apply</h3>
                      <p className="mt-2 text-lg leading-relaxed text-slate-300">
                        Tell us where you are and where you want to go. We&apos;ll assess your background and map out a
                        clear path forward.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 sm:text-xl">Step 2 — Get Coached</h3>
                      <p className="mt-2 text-lg leading-relaxed text-slate-300">
                        Resume. LinkedIn. Interview prep. Pitch coaching. We&apos;ll make sure you show up to every
                        opportunity looking like the top candidate — because you are.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 sm:text-xl">Step 3 — Land Your Career</h3>
                      <p className="mt-2 text-lg leading-relaxed text-slate-300">
                        Put the skills you&apos;ve learned to work — for you.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://calendar.app.google/ca4jkCKsquRVsndB7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300"
                  >
                    Book Your Free Strategy Call
                  </a>
                </div>

              </div>
            </div>
            <div className="mt-16 sm:mt-20">
              <p className="mb-6 text-center text-base font-semibold text-amber-300 sm:text-lg">
                Positions NAJ Prepares Candidates For
              </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'SDR / BDR',
                  subtitle: 'Sales Development Representative / Business Development Representative',
                  definition: 'Entry-level role focused on lead generation, outreach, and booking meetings.',
                  base: '$55K – $75K base',
                  ote: '$70K – $100K OTE',
                  skills: ['Ideal Customer Profile', 'Account Research', 'Proactive Outreach', 'Interviewing', 'Networking'],
                  image: '/sdr-bdr.png',
                },
                {
                  title: 'SMB / Mid-Market AE',
                  subtitle: 'Account Executive',
                  definition: 'Core closer role for smaller deals with faster sales cycles.',
                  base: '$70K – $100K base',
                  ote: '$110K – $200K OTE',
                  skills: ['Consultative Selling', 'Negotiation', 'Executive Presence', 'Mock Call Prep', 'Pipeline Accuracy'],
                  image: '/mid-market-ae.png',
                },
                {
                  title: 'Enterprise AE',
                  subtitle: 'Strategic Account Executive',
                  definition: 'Closes large, complex deals with multiple stakeholders and long cycles.',
                  base: '$100K – $150K+ base',
                  ote: '$180K – $320K+ OTE',
                  skills: ['Multi-threaded Selling', 'Stakeholder Management', 'Negotiation', 'Forecast Accuracy', 'Networking'],
                  image: '/enterprise-ae.png',
                },
              ].map((role) => (
                <div
                  key={role.title}
                  className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#140a26]/80 shadow-lg shadow-amber-900/10"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={role.image}
                      alt={`${role.title} - ${role.subtitle}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 underline decoration-amber-300/60">{role.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{role.subtitle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Role Definition</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{role.definition}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Typical Salaries</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-amber-400/20 px-3 py-1.5 text-sm font-medium text-amber-200">{role.base}</span>
                        <span className="rounded-lg bg-amber-400/20 px-3 py-1.5 text-sm font-medium text-amber-200">{role.ote}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Skills Trained</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </section>

        <section id="candidates" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
              Don&apos;t take our word for it.
            </h2>
            <div className="mt-12 space-y-12">
              <blockquote className="border-l-4 border-amber-400/80 pl-6 sm:pl-8">
                <p className="text-xl font-medium leading-relaxed text-amber-400 sm:text-2xl">
                  &ldquo;Before engaging with NAJ, I was stuck in limbo as a BDR. I couldn&apos;t break into AE roles at
                  other companies I worked for despite solid stats. NAJ began to describe how I felt. They showed me how
                  to develop my skill sets and helped me land my first closing role.&rdquo;
                </p>
                <cite className="mt-4 block text-base not-italic text-amber-300/90">— James T.</cite>
              </blockquote>
              <blockquote className="border-l-4 border-amber-400/80 pl-6 sm:pl-8">
                <p className="text-xl font-medium leading-relaxed text-amber-400 sm:text-2xl">
                  &ldquo;NAJ showed me that the skills and roles I held in the Army were valuable. They showed me how to
                  find roles that would build on that. I owe NAJ tremendously and I recommend them to any transitioning
                  military member going into sales.&rdquo;
                </p>
                <cite className="mt-4 block text-base not-italic text-amber-300/90">— Andrew T.</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="veterans" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
              The longer you wait, the more it costs you.
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">
              Every month without the right role is a month of income you&apos;ll never get back. Every year stuck at the
              wrong level is a year of momentum, promotions, and earning potential lost.
            </p>
            <p className="text-lg leading-relaxed text-slate-300">
              The people who break through — whether they&apos;re transitioning into tech sales for the first time or
              finally moving up after years of being overlooked — share one thing in common: they stopped trying to figure
              it out alone.
            </p>
            <p className="text-lg leading-relaxed text-slate-300">
              They had the right guide. The right preparation. The right introductions.
            </p>
            <p className="text-lg leading-relaxed text-slate-300">
              The candidates who don&apos;t? They settle. They take the role that&apos;s two levels below what they&apos;re
              worth. They stay stuck on a team that doesn&apos;t invest in them. They keep sending applications that go
              nowhere — and start wondering if the problem is them.
            </p>
            <p className="text-lg font-semibold leading-relaxed text-slate-100">
              It&apos;s not you. It&apos;s the approach.
            </p>
            <p className="text-lg font-bold leading-relaxed text-amber-300">
              That&apos;s exactly what NAJ is built to change.
            </p>
            <a
              href="https://calendar.app.google/ca4jkCKsquRVsndB7"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300"
            >
              Book Your Free Strategy Call
            </a>
          </div>
        </section>

        <section id="team" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
              Imagine your first week.
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">
              You&apos;re onboarding at a company you&apos;ve actually heard of. The comp is real. The team is sharp. And
              for the first time since leaving service, you&apos;re in an environment that rewards exactly how you&apos;re
              wired — mission-focused, disciplined, built to win.
            </p>
            <p className="text-lg font-bold leading-relaxed text-amber-300">
              That&apos;s not a dream. That&apos;s what NAJ candidates do.
            </p>
            <a
              href="https://calendar.app.google/ca4jkCKsquRVsndB7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0c071a] shadow-sm transition-colors hover:bg-amber-300"
            >
              Book Your Free Strategy Call
            </a>
          </div>
        </section>

        <section id="employers-cta" className="border-t border-white/10 bg-[#0f081d]/90">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-left text-4xl font-semibold tracking-tight text-transparent lg:text-5xl">
              Hiring managers — meet your next top performer.
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">
              Our Candidates don&apos;t need to be trained to show up on time, handle rejection, or operate under
              pressure. They need to be handed a quota and a territory.
            </p>
            <p className="text-lg leading-relaxed text-slate-300">
              If you&apos;re building a GTM team and want candidates who are wired differently — reach out.
            </p>
            <a
              href="/employers"
              className="inline-flex text-lg font-semibold text-amber-400 underline decoration-amber-400/60 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300"
            >
              Learn About Hiring NAJ Candidates →
            </a>
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
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#home" className="hover:text-white">Home</a>
            <a href="#candidates" className="hover:text-white">Testimonials</a>
            <a href="#employers-cta" className="hover:text-white">Hiring managers</a>
            <a href="/employers" className="hover:text-white">Employer services</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}