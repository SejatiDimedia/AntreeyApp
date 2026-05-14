import React from 'react';
import { useEffect, useState } from 'react';
import { SettingsNav } from './components/SettingsNav';
import { BusinessProfile } from './components/BusinessProfile';
import { DEFAULT_OPERATING_HOURS, OperatingHours, normalizeOperatingHours } from './components/OperatingHours';
import { NotificationPreferences } from './components/NotificationPreferences';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository } from '../../repositories';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { activeBusiness } = useBusiness();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    address: '',
    logoUrl: '',
    coverImageUrl: '',
    queuePrefix: 'A',
    queuePadLength: 1,
    queuePadLengthInput: '1',
    isPublic: true,
    operatingHours: DEFAULT_OPERATING_HOURS,
    paymentMethods: [],
    notificationPreferences: {
      paymentReview: true,
      newBooking: true,
      dailySummary: true,
      customerUpdates: true
    }
  });

  const buildFormFromBusiness = (business) => {
    if (!business) return null;
    return {
      name: business.name || '',
      category: business.category || '',
      description: business.description || '',
      phone: business.phone || '',
      address: business.address || '',
      logoUrl: business.logoUrl || business.logo || '',
      coverImageUrl: business.coverImageUrl || business.bannerUrl || business.imageUrl || '',
      queuePrefix: business.queuePrefix || 'A',
      queuePadLength: Number(business.queuePadLength || 1),
      queuePadLengthInput: String(business.queuePadLength || 1),
      isPublic: business.isPublic !== false,
      operatingHours: normalizeOperatingHours(business.operatingHours),
      paymentMethods: Array.isArray(business.paymentMethods) ? business.paymentMethods : [],
      notificationPreferences: {
        paymentReview: business.notificationPreferences?.paymentReview !== false,
        newBooking: business.notificationPreferences?.newBooking !== false,
        dailySummary: business.notificationPreferences?.dailySummary !== false,
        customerUpdates: business.notificationPreferences?.customerUpdates !== false
      }
    };
  };

  useEffect(() => {
    if (!activeBusiness) return;
    setFormData(buildFormFromBusiness(activeBusiness));
  }, [activeBusiness]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!activeBusiness?.id) return;
    setSaving(true);
    try {
      const paymentMethods = (formData.paymentMethods || [])
        .map((method) => ({
          bankName: String(method.bankName || '').trim(),
          accountName: String(method.accountName || '').trim(),
          accountNumber: String(method.accountNumber || '').trim(),
          note: String(method.note || '').trim()
        }))
        .filter((method) => method.bankName || method.accountName || method.accountNumber);

      const payload = {
        ...formData,
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        queuePrefix: (formData.queuePrefix || 'A').trim().toUpperCase(),
        queuePadLength: Number(formData.queuePadLength || 1),
        operatingHours: normalizeOperatingHours(formData.operatingHours),
        paymentMethods,
        updatedAt: new Date().toISOString()
      };
      delete payload.queuePadLengthInput;
      await BusinessRepository.updateBusinessProfile(activeBusiness.id, payload);
      toast.success('Business settings saved successfully.');
    } catch (error) {
      console.error('Save business settings failed:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    const next = buildFormFromBusiness(activeBusiness);
    if (next) setFormData(next);
    toast.message('Unsaved settings have been discarded.');
  };

  return (
    <div className="grid grid-cols-12 gap-card-gap pb-12">
      <div className="col-span-12 lg:col-span-3">
        <SettingsNav />
      </div>

      <div className="col-span-12 lg:col-span-9 space-y-card-gap">
        <BusinessProfile formData={formData} onChange={handleFieldChange} />
        <OperatingHours value={formData.operatingHours} onChange={(value) => handleFieldChange('operatingHours', value)} />
        <NotificationPreferences value={formData.notificationPreferences} onChange={(value) => handleFieldChange('notificationPreferences', value)} />

        <div className="glass-card rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-primary/20 mt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <h4 className="font-label-md">Ready to publish changes?</h4>
              <p className="text-label-sm text-on-surface-variant">Updates to your business profile will be live instantly.</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={handleDiscard} className="flex-1 md:flex-none px-6 py-3 rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-high transition-colors">Discard</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 md:flex-none px-8 py-3 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? 'Saving...' : 'Save & Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
