import React from 'react';

export const BusinessProfile = ({ formData, onChange }) => {
  const handleQueueDigitInput = (raw) => {
    const cleaned = String(raw || '').replace(/\D/g, '').slice(0, 6);
    const normalized = cleaned || '1';
    const parsedByLength = cleaned.startsWith('0') ? cleaned.length : Number(normalized);
    const queuePadLength = Math.max(1, Math.min(6, Number(parsedByLength || 1)));
    onChange('queuePadLengthInput', normalized);
    onChange('queuePadLength', queuePadLength);
  };

  return (
    <section className="glass-card rounded-[24px] overflow-hidden">
      <div className="p-8 border-b border-outline-variant/30">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Business Profile</h2>
        <p className="text-on-surface-variant text-body-md mt-1">This information will be visible to your customers on the booking page.</p>
      </div>
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-2 flex items-center gap-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-[32px] bg-surface-container flex items-center justify-center overflow-hidden border-2 border-dashed border-outline">
              <span className="material-symbols-outlined text-outline text-3xl group-hover:hidden">add_a_photo</span>
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-primary font-label-sm">Edit</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface">Business Logo</h4>
            <p className="text-label-sm text-on-surface-variant">SVG, PNG, JPG up to 10MB. Recommended 256x256px.</p>
            <button className="mt-2 text-primary font-label-sm hover:underline">Upload new logo</button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="font-label-md text-on-surface">Business Name</label>
          <input className="w-full p-4 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-body-md transition-all" type="text" value={formData.name || ''} onChange={(e) => onChange('name', e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <label className="font-label-md text-on-surface">Business Category</label>
          <select className="w-full p-4 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-body-md appearance-none transition-all" value={formData.category || ''} onChange={(e) => onChange('category', e.target.value)}>
            <option value="">Select category</option>
            <option>Hair Salon & Spa</option>
            <option>Medical Clinic</option>
            <option>Fitness Center</option>
            <option>Creative Agency</option>
            <option>Sports Venue</option>
          </select>
        </div>
        
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="font-label-md text-on-surface">Description</label>
          <textarea className="w-full p-4 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-body-md resize-none transition-all" rows="4" value={formData.description || ''} onChange={(e) => onChange('description', e.target.value)}></textarea>
        </div>

        <div className="space-y-2">
          <label className="font-label-md text-on-surface">Queue Prefix</label>
          <input
            className="w-full p-4 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-body-md transition-all"
            type="text"
            maxLength={6}
            value={formData.queuePrefix || 'A'}
            onChange={(e) => onChange('queuePrefix', (e.target.value || 'A').toUpperCase())}
            placeholder="A"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label-md text-on-surface">Queue Digit Length</label>
          <input
            className="w-full p-4 bg-surface-container-low focus:bg-surface-container-lowest rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-body-md transition-all"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={formData.queuePadLengthInput || String(formData.queuePadLength || 1)}
            onChange={(e) => handleQueueDigitInput(e.target.value)}
          />
          <p className="text-label-sm text-on-surface-variant">Contoh: prefix `BDM` + digit `3` menjadi `BDM-001`.</p>
        </div>
      </div>
    </section>
  );
};
