import React from 'react';

export const CustomerPreview = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-card-gap">
      {/* Customer Profile Summary */}
      <div className="lg:col-span-4 glass-card rounded-[24px] p-container-padding relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full -mr-10 -mt-10"></div>
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <img 
              alt="Active Customer Preview" 
              className="w-20 h-20 rounded-2xl bg-primary-container p-1 border-2 border-white object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANEQ_M-HWtp1Z_aKe3cNWkHGpSSKI0jmrvLLjrbAX7wz--1R68Kju_oe8IeQFrtKHaFSj-Xojr_1C7XF5qI0ARs10n4Y-wkZiBYfGAYBcyykXWW-AkzNKD7w36BIztV6u_q5aieStjdQwNbJFuUXHunCWRPWuRnWsSjt2AfjX8sHI-1YgScuqU1ehzhMZ31jIs_UBFGSA6zzCuTcsmEM6ZdH99LiCzsj7acYlcpZMYLlqBL54dCWQhtNMFBdd0xZGVIYpfyzFSzt46" 
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary border-2 border-white rounded-full"></span>
          </div>
          <button className="bg-surface text-on-surface-variant p-2 rounded-full border border-outline-variant/20 shadow-sm hover:text-primary transition-colors">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
        <h3 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Rendy Pratama</h3>
        <p className="text-body-md text-on-surface-variant mb-4">Elite Member since Aug 2023</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">call</span>
            <span className="text-label-md">+62 869 1234 5670</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">mail</span>
            <span className="text-label-md">rendy.p@email.com</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <span className="text-label-md">Jakarta, Indonesia</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-outline-variant/20 flex gap-4">
          <button className="flex-1 bg-inverse-surface text-on-primary py-3 rounded-xl font-label-md text-center hover:opacity-90 transition-opacity">Book Now</button>
          <button className="p-3 bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">chat</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="lg:col-span-8 glass-card rounded-[24px] p-container-padding">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Recent Activity</h3>
          <button className="text-primary font-label-md hover:underline">View History</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low border border-white/40">
            <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-label-md text-on-surface">Service Completed</p>
                <span className="text-[12px] text-on-surface-variant">2 days ago</span>
              </div>
              <p className="text-body-md text-on-surface-variant">Haircut + Beard Trim with <span className="font-label-md">Widodo</span></p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-label-md text-on-surface">Payment Successful</p>
                <span className="text-[12px] text-on-surface-variant">2 days ago</span>
              </div>
              <p className="text-body-md text-on-surface-variant">Paid <span className="font-label-md">Rp 150.000</span> for invoice #INV-293</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-label-md text-on-surface">Upcoming Appointment</p>
                <span className="text-[12px] text-primary font-label-md">Scheduled</span>
              </div>
              <p className="text-body-md text-on-surface-variant">Full Grooming on <span className="font-label-md">28 Oct 2024 at 10:00</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
