import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 h-20 bg-white/70 backdrop-blur-xl z-[100] border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-primary font-black text-on-surface tracking-tight">Antreey</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-bold text-on-surface-variant/70 hover:text-primary transition-colors uppercase tracking-widest">Features</a>
          <a href="#how-it-works" className="text-sm font-bold text-on-surface-variant/70 hover:text-primary transition-colors uppercase tracking-widest">How it Works</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-sm font-black text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link>
          <Link to="/signup" className="h-11 px-6 rounded-full bg-inverse-surface text-inverse-on-surface text-sm font-black transition-all hover:opacity-90 active:scale-95 flex items-center justify-center">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card rounded-[40px] p-8 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
    </div>
    <h3 className="text-xl font-black text-on-surface mb-3 tracking-tight">{title}</h3>
    <p className="text-on-surface-variant/60 leading-relaxed text-sm font-medium">{description}</p>
  </div>
);

const HeroIllustration = () => (
  <svg viewBox="0 0 620 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_45px_90px_rgba(72,104,0,0.16)]">
    <defs>
      <linearGradient id="hero_bg_grad" x1="40" y1="20" x2="580" y2="540" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f8faf3" />
        <stop offset="0.52" stopColor="#f0f4e8" />
        <stop offset="1" stopColor="#e7ede0" />
      </linearGradient>
      <linearGradient id="hero_phone_grad" x1="151" y1="78" x2="338" y2="492" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#f8faf3" />
      </linearGradient>
      <linearGradient id="hero_queue_grad" x1="180" y1="178" x2="312" y2="310" gradientUnits="userSpaceOnUse">
        <stop stopColor="#486800" />
        <stop offset="1" stopColor="#2e4300" />
      </linearGradient>
      <linearGradient id="hero_dashboard_grad" x1="336" y1="120" x2="568" y2="388" gradientUnits="userSpaceOnUse">
        <stop stopColor="#191c18" />
        <stop offset="1" stopColor="#111310" />
      </linearGradient>
      <linearGradient id="hero_accent_grad" x1="385" y1="370" x2="535" y2="492" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a6e22e" />
        <stop offset="1" stopColor="#9dd823" />
      </linearGradient>
      <filter id="hero_soft_shadow" x="58" y="40" width="540" height="490" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="20" />
        <feGaussianBlur stdDeviation="28" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.28 0 0 0 0 0.4 0 0 0 0 0 0 0 0 0.16 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>

    <rect x="28" y="32" width="564" height="486" rx="64" fill="url(#hero_bg_grad)" />
    <circle cx="123" cy="114" r="58" fill="#486800" fillOpacity="0.12" className="animate-pulse-slow" />
    <circle cx="548" cy="116" r="86" fill="#a6e22e" fillOpacity="0.09" className="animate-float" style={{ animationDuration: '8s' }} />
    <circle cx="506" cy="486" r="62" fill="#4c6700" fillOpacity="0.10" className="animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }} />

    <g filter="url(#hero_soft_shadow)">
      <g className="animate-float" style={{ animationDuration: '5.5s' }}>
        <rect x="126" y="70" width="230" height="442" rx="52" fill="#191c18" />
        <rect x="140" y="84" width="202" height="414" rx="42" fill="url(#hero_phone_grad)" />
        <rect x="205" y="99" width="72" height="16" rx="8" fill="#191c18" />

        <g transform="translate(164 136)">
          <rect width="154" height="38" rx="19" fill="#f0f4e8" />
          <circle cx="20" cy="19" r="10" fill="#486800" fillOpacity="0.16" />
          <path d="M16 19L19 22L25 15" stroke="#486800" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="42" y="16" className="text-[9px] font-black fill-primary uppercase tracking-widest">Sport Minton</text>
          <text x="42" y="28" className="text-[8px] font-bold fill-on-surface-variant/40">Open until 22:00</text>
        </g>

        <g transform="translate(156 200)">
          <rect width="170" height="130" rx="35" fill="url(#hero_queue_grad)" />
          <circle cx="102" cy="28" r="17" fill="white" fillOpacity="0.18" />
          <text x="85" y="35" textAnchor="middle" className="text-[10px] font-black fill-white/70 uppercase tracking-[0.2em]">Your Queue</text>
          <text x="85" y="88" textAnchor="middle" className="text-[46px] font-black fill-white tracking-tighter">A-007</text>
          <rect x="55" y="102" width="70" height="18" rx="9" fill="white" fillOpacity="0.18" />
          <text x="90" y="115" textAnchor="middle" className="text-[8px] font-black fill-white uppercase">12 min left</text>
        </g>

        <g transform="translate(164 346)">
          <text x="0" y="0" className="text-[10px] font-black fill-on-surface-variant/30 uppercase tracking-[0.22em]">Today</text>
          <g transform="translate(0 16)">
            <rect width="154" height="30" rx="15" fill="#f8faf3" stroke="#e1e3dc" />
            <circle cx="16" cy="15" r="7" fill="#486800" fillOpacity="0.16" />
            <text x="32" y="13" className="text-[8px] font-black fill-on-surface">Court Rental</text>
            <text x="32" y="23" className="text-[7px] font-bold fill-on-surface-variant/40">19:30</text>
            <rect x="122" y="10" width="20" height="10" rx="5" fill="#486800" fillOpacity="0.14" />
          </g>
          <g transform="translate(0 54)">
            <rect width="154" height="30" rx="15" fill="#f8faf3" stroke="#e1e3dc" />
            <circle cx="16" cy="15" r="7" fill="#a6e22e" fillOpacity="0.16" />
            <text x="32" y="13" className="text-[8px] font-black fill-on-surface">Coaching</text>
            <text x="32" y="23" className="text-[7px] font-bold fill-on-surface-variant/40">20:00</text>
            <rect x="122" y="10" width="20" height="10" rx="5" fill="#a6e22e" fillOpacity="0.14" />
          </g>
          <g transform="translate(0 92)">
            <rect width="154" height="30" rx="15" fill="#f8faf3" stroke="#e1e3dc" />
            <circle cx="16" cy="15" r="7" fill="#4c6700" fillOpacity="0.16" />
            <text x="32" y="13" className="text-[8px] font-black fill-on-surface">Walk-in Slot</text>
            <text x="32" y="23" className="text-[7px] font-bold fill-on-surface-variant/40">21:00</text>
            <rect x="122" y="10" width="20" height="10" rx="5" fill="#4c6700" fillOpacity="0.14" />
          </g>
        </g>
      </g>

      <g className="animate-float" style={{ animationDelay: '0.8s', animationDuration: '6.5s' }}>
        <rect x="330" y="118" width="232" height="256" rx="36" fill="url(#hero_dashboard_grad)" />
        <rect x="350" y="144" width="74" height="12" rx="6" fill="white" fillOpacity="0.22" />
        <rect x="350" y="166" width="130" height="8" rx="4" fill="white" fillOpacity="0.12" />
        <rect x="500" y="142" width="38" height="22" rx="11" fill="#486800" fillOpacity="0.22" />
        <text x="519" y="157" textAnchor="middle" className="text-[8px] font-black fill-[#a6e22e]">LIVE</text>

        <g transform="translate(350 194)">
          <g>
            <rect width="52" height="58" rx="16" fill="white" fillOpacity="0.08" />
            <text x="12" y="22" className="text-[18px] font-black" fill="#486800">42</text>
            <text x="12" y="40" className="text-[6px] font-bold fill-white/40 uppercase">Bookings</text>
          </g>
          <g transform="translate(62 0)">
            <rect width="52" height="58" rx="16" fill="white" fillOpacity="0.08" />
            <text x="12" y="22" className="text-[18px] font-black" fill="#a6e22e">06</text>
            <text x="12" y="40" className="text-[6px] font-bold fill-white/40 uppercase">Review</text>
          </g>
          <g transform="translate(124 0)">
            <rect width="52" height="58" rx="16" fill="white" fillOpacity="0.08" />
            <text x="12" y="22" className="text-[18px] font-black" fill="#4c6700">08</text>
            <text x="12" y="40" className="text-[6px] font-bold fill-white/40 uppercase">Staff</text>
          </g>
        </g>

        <g transform="translate(350 276)">
          <rect width="188" height="74" rx="22" fill="white" fillOpacity="0.08" />
          <text x="18" y="24" className="text-[8px] font-black fill-white/45 uppercase tracking-widest">Service Performance</text>
          <rect x="18" y="38" width="130" height="7" rx="3.5" fill="white" fillOpacity="0.12" />
          <rect x="18" y="38" width="96" height="7" rx="3.5" fill="#486800" />
          <rect x="18" y="54" width="130" height="7" rx="3.5" fill="white" fillOpacity="0.12" />
          <rect x="18" y="54" width="62" height="7" rx="3.5" fill="#a6e22e" />
          <circle cx="160" cy="49" r="16" fill="#4c6700" fillOpacity="0.18" />
        </g>
      </g>

      <g className="animate-float" style={{ animationDelay: '1.2s', animationDuration: '5s' }}>
        <rect x="374" y="394" width="156" height="88" rx="28" fill="url(#hero_accent_grad)" />
        <text x="398" y="426" className="text-[10px] font-black fill-primary/60 uppercase tracking-widest">Queue TV</text>
        <text x="398" y="458" className="text-[34px] font-black fill-primary tracking-tighter">A-007</text>
        <circle cx="500" cy="438" r="18" fill="white" fillOpacity="0.18" />
        <path d="M492 438L498 444L509 431" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Add Walk-in Popup */}
      <g className="animate-float" style={{ animationDelay: '0.4s', animationDuration: '6s' }}>
        <rect x="76" y="384" width="118" height="72" rx="24" fill="white" stroke="#e1e3dc" />
        <circle cx="104" cy="420" r="18" fill="#f8faf3" />
        <path d="M96 421H112M104 413V429" stroke="#486800" strokeWidth="3" strokeLinecap="round" />
        <text x="132" y="414" className="text-[8px] font-black fill-on-surface-variant/30 uppercase">Walk-in</text>
        <text x="132" y="430" className="text-[12px] font-black fill-on-surface">Added</text>
      </g>
    </g>
  </svg>
);

const WorkflowIllustration = () => (
  <svg></svg>
);

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-bright selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              New: Real-time Queue Tracking
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-on-surface leading-[1.1] tracking-tighter">
              Manage your <span className="text-primary">Business Flow</span> with elegance.
            </h1>
            <p className="text-lg lg:text-xl text-on-surface-variant/60 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Eliminate waiting lines and modernize your customer experience. Antreey provides a premium booking and queue system for professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="h-16 px-10 rounded-full bg-primary text-on-primary font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Start Free Trial
              </button>
              <button className="h-16 px-10 rounded-full bg-surface-container-high text-on-surface font-black text-lg hover:bg-surface-container transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-bright bg-surface-container flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">person</span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-on-surface-variant/40 uppercase tracking-widest">
                Trusted by <span className="text-on-surface font-black">500+</span> Businesses
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-3xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-75 opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-inverse-surface text-inverse-on-surface overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-12 relative z-10">
          {[
            { label: 'Total Bookings', value: '1.2M+' },
            { label: 'Active Merchants', value: '5K+' },
            { label: 'Average Wait Time', value: '-45%' },
            { label: 'User Rating', value: '4.9/5' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center sm:items-start">
              <span className="text-4xl lg:text-5xl font-black tracking-tighter mb-1">{stat.value}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-inverse-on-surface/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Illustration Section */}
      <section id="how-it-works" className="py-32 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10 order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">The Experience</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-on-surface tracking-tighter leading-tight">
                A seamless journey for <span className="text-primary">everyone.</span>
              </h3>
              <p className="text-lg text-on-surface-variant/60 font-medium leading-relaxed">
                We've designed the entire service flow to be as frictionless as possible, from the first click to the final service.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { step: '01', title: 'Smart Booking', desc: 'Customers book their favorite service and professional in seconds through a beautiful interface.' },
                { step: '02', title: 'Live Tracking', desc: 'No more guessing. Customers track their queue status in real-time from anywhere.' },
                { step: '03', title: 'Efficient Service', desc: 'Arrive just in time. Staff manage the flow effortlessly through the central dashboard.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="text-3xl font-black text-primary/20 group-hover:text-primary transition-colors duration-500">{item.step}</div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-on-surface tracking-tight">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant/50 font-medium leading-relaxed max-w-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 order-1 lg:order-2">
            <WorkflowIllustration />
          </div>
        </div>
      </section >

      {/* Features Section */}
      < section id="features" className="py-32 px-6" >
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Powerful Core</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-on-surface tracking-tighter">Everything you need to <span className="text-primary">scale</span> your operations.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="monitoring"
              title="Real-time Tracking"
              description="Customers can track their queue position live on their mobile phones, reducing perceived wait time."
            />
            <FeatureCard
              icon="calendar_month"
              title="Smart Scheduling"
              description="Optimize staff availability and resource allocation with our intelligent booking engine."
            />
            <FeatureCard
              icon="payments"
              title="Seamless Payments"
              description="Integrated payment proof system and deposit management to reduce no-shows."
            />
            <FeatureCard
              icon="group"
              title="Team Management"
              description="Manage multiple staff members, roles, and individual schedules from a single dashboard."
            />
            <FeatureCard
              icon="tv"
              title="Queue Display"
              description="Native support for Queue TV displays to keep walk-in customers informed."
            />
            <FeatureCard
              icon="analytics"
              title="Deep Insights"
              description="Get detailed reports on peak hours, service performance, and customer satisfaction."
            />
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-32 px-6" >
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[60px] p-12 lg:p-24 bg-inverse-surface relative overflow-hidden flex flex-col items-center text-center space-y-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <h3 className="text-4xl lg:text-6xl font-black text-white tracking-tighter max-w-3xl relative z-10">
              Ready to modernize your booking experience?
            </h3>
            <p className="text-lg lg:text-xl text-white/80 max-w-2xl font-medium relative z-10">
              Join thousands of businesses that trust Antreey to handle their daily flow. No credit card required to start.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="h-16 px-12 rounded-full bg-primary text-on-primary font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95 relative z-10"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-20 px-6 border-t border-outline-variant/10" >
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[40px] bg-surface-container-low/60 border border-outline-variant/10 p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-5 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="text-primary text-2xl font-bold text-on-surface tracking-tight"> Antreey</span>
              </div>
              <p className="text-on-surface-variant/60 text-sm md:text-base leading-relaxed">
                A modern booking and queue operating system for service businesses that need realtime flow, payment proof review, walk-in handling, and customer-ready queue tickets.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { icon: 'event_available', label: 'Booking' },
                { icon: 'confirmation_number', label: 'Queue' },
                { icon: 'payments', label: 'Payments' },
                { icon: 'tv', label: 'Queue TV' }
              ].map((item) => (
                <div key={item.label} className="min-w-[112px] rounded-2xl bg-surface border border-outline-variant/10 px-4 py-4 text-center">
                  <span className="material-symbols-outlined text-primary text-[24px]">{item.icon}</span>
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-on-surface-variant/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">
                Built for calmer queues and faster service days.
              </p>
            </div>
            <p className="text-xs font-bold text-on-surface-variant/30 uppercase tracking-widest">
              © 2026 Antreey. All rights reserved.
            </p>
          </div>
        </div>
      </footer >
    </div >
  );
};
