import React from 'react';

export const Promotions = () => {
  return (
    <div className="mt-section-margin grid grid-cols-1 md:grid-cols-3 gap-card-gap pb-10">
      <div className="md:col-span-2 relative overflow-hidden rounded-3xl h-64 bg-inverse-surface group cursor-pointer">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC8Zo9h5nES1ajK3-YxQYbA0um8xVJcz1yGmmN_W423GEczPPqDQ716YoKKF04RMCGnW7_wi0fmcKc8C8ECJAdaPrumK4P32T1bEWbW4f0tsOkdln8Gq1jmLTznQmOqMYQkkb_MCPNuKIrItQxfuoLk42EyHwQfhfipXCaH6YLAeGHPRLdgXcrVBdjIqThJIsc-kJyeqM94wPFKxJQoseofSgVAeqeRzCHM2u0BXq9caykqVGzHnJ5lWekM7G0KzBTnRESAVYMVM5_" 
          alt="Interior Salon" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex flex-col justify-end">
          <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm w-fit mb-4">Manager's Choice</span>
          <h3 className="text-white font-headline-lg">Enhance your booking experience with Antreey Pro</h3>
          <p className="text-white/70 font-body-md mt-2">Unlock unlimited staff accounts and automated WhatsApp reminders.</p>
        </div>
      </div>
      <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[32px]">volunteer_activism</span>
        </div>
        <div>
          <h4 className="font-headline-lg-mobile">Customer Loyalty</h4>
          <p className="text-on-surface-variant font-body-md">Reward your regular clients with discount points automatically.</p>
        </div>
        <button className="text-primary font-label-md border-b-2 border-primary hover:text-primary-fixed-dim hover:border-primary-fixed-dim transition-colors">Learn more</button>
      </div>
    </div>
  );
};
