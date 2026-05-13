import React, { useState } from 'react';

export const BusinessProfile = ({ formData, onChange }) => {
  const [uploadingField, setUploadingField] = useState('');
  const [uploadError, setUploadError] = useState('');
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  const handleQueueDigitInput = (raw) => {
    const cleaned = String(raw || '').replace(/\D/g, '').slice(0, 6);
    const normalized = cleaned || '1';
    const parsedByLength = cleaned.startsWith('0') ? cleaned.length : Number(normalized);
    const queuePadLength = Math.max(1, Math.min(6, Number(parsedByLength || 1)));
    onChange('queuePadLengthInput', normalized);
    onChange('queuePadLength', queuePadLength);
  };
  const paymentMethods = Array.isArray(formData.paymentMethods) ? formData.paymentMethods : [];
  const updatePaymentMethod = (index, field, value) => {
    const next = paymentMethods.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange('paymentMethods', next);
  };
  const addPaymentMethod = () => {
    onChange('paymentMethods', [...paymentMethods, { bankName: '', accountName: '', accountNumber: '', note: '' }]);
  };
  const removePaymentMethod = (index) => {
    onChange('paymentMethods', paymentMethods.filter((_, idx) => idx !== index));
  };
  const uploadImage = async (file, field) => {
    if (!file) return;
    setUploadError('');
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      setUploadError('Cloudinary env belum lengkap. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    setUploadingField(field);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', cloudinaryUploadPreset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: form
      });
      const result = await response.json();
      if (!response.ok || !result.secure_url) {
        throw new Error(result?.error?.message || 'Upload failed');
      }
      onChange(field, result.secure_url);
    } catch (error) {
      setUploadError(error?.message || 'Failed to upload image.');
    } finally {
      setUploadingField('');
    }
  };

  return (
    <section className="glass-card rounded-[24px] overflow-hidden">
      <div className="p-8 border-b border-outline-variant/30">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Business Profile</h2>
        <p className="text-on-surface-variant text-body-md mt-1">This information will be visible to your customers on the booking page.</p>
      </div>
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-[28px] bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/30">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Business logo preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-outline text-3xl">storefront</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-label-md text-on-surface">Business Logo</h4>
                <p className="text-label-sm text-on-surface-variant">Shown on customer app header. Square image works best.</p>
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  {uploadingField === 'logoUrl' ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={Boolean(uploadingField)}
                    onChange={(e) => uploadImage(e.target.files?.[0], 'logoUrl')}
                  />
                </label>
              </div>
            </div>
            <input
              className="mt-4 w-full p-3 bg-surface focus:bg-surface-container-lowest rounded-xl border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              type="url"
              placeholder="Logo image URL"
              value={formData.logoUrl || ''}
              onChange={(e) => onChange('logoUrl', e.target.value)}
            />
          </div>

          <div className="rounded-3xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="h-32 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/30">
              {formData.coverImageUrl ? (
                <img src={formData.coverImageUrl} alt="Business cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-label-md text-on-surface">Customer App Cover</h4>
                <p className="text-label-sm text-on-surface-variant">Hero image on storefront. Recommended landscape image.</p>
              </div>
              <label className="shrink-0 inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary text-white px-4 py-2 text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">upload</span>
                {uploadingField === 'coverImageUrl' ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={Boolean(uploadingField)}
                  onChange={(e) => uploadImage(e.target.files?.[0], 'coverImageUrl')}
                />
              </label>
            </div>
            <input
              className="mt-4 w-full p-3 bg-surface focus:bg-surface-container-lowest rounded-xl border border-outline-variant/20 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              type="url"
              placeholder="Cover image URL"
              value={formData.coverImageUrl || ''}
              onChange={(e) => onChange('coverImageUrl', e.target.value)}
            />
          </div>
          {uploadError && (
            <div className="xl:col-span-2 rounded-2xl bg-error-container/70 text-on-error-container px-4 py-3 text-sm">
              {uploadError}
            </div>
          )}
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
          <p className="text-label-sm text-on-surface-variant">Example: prefix `BDM` + digit `3` becomes `BDM-001`.</p>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-on-surface">Payment Methods (Transfer)</label>
            <button type="button" onClick={addPaymentMethod} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">
              Add Account
            </button>
          </div>
          {paymentMethods.length === 0 && (
            <p className="text-sm text-on-surface-variant">No payment account yet. Add at least one account.</p>
          )}
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <div key={`payment-${index}`} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="p-3 rounded-xl bg-surface" placeholder="Bank / eWallet name" value={method.bankName || ''} onChange={(e) => updatePaymentMethod(index, 'bankName', e.target.value)} />
                <input className="p-3 rounded-xl bg-surface" placeholder="Account name" value={method.accountName || ''} onChange={(e) => updatePaymentMethod(index, 'accountName', e.target.value)} />
                <input className="p-3 rounded-xl bg-surface" placeholder="Account number" value={method.accountNumber || ''} onChange={(e) => updatePaymentMethod(index, 'accountNumber', e.target.value)} />
                <input className="p-3 rounded-xl bg-surface" placeholder="Note (optional)" value={method.note || ''} onChange={(e) => updatePaymentMethod(index, 'note', e.target.value)} />
                <div className="md:col-span-2 flex justify-end">
                  <button type="button" onClick={() => removePaymentMethod(index)} className="px-3 py-1.5 rounded-lg bg-error-container text-error text-xs font-semibold">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
