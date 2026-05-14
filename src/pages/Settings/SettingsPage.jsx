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
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    logoUrl: '',
    coverImageUrl: '',
    queuePrefix: 'A',
    queuePadLength: 1,
    queuePadLengthInput: '1',
    isPublic: true,
    operatingHours: DEFAULT_OPERATING_HOURS,
    paymentMethods: []
  });

  useEffect(() => {
    if (!activeBusiness) return;
    setFormData({
      name: activeBusiness.name || '',
      category: activeBusiness.category || '',
      description: activeBusiness.description || '',
      logoUrl: activeBusiness.logoUrl || activeBusiness.logo || '',
      coverImageUrl: activeBusiness.coverImageUrl || activeBusiness.bannerUrl || activeBusiness.imageUrl || '',
      queuePrefix: activeBusiness.queuePrefix || 'A',
      queuePadLength: Number(activeBusiness.queuePadLength || 1),
      queuePadLengthInput: String(activeBusiness.queuePadLength || 1),
      isPublic: activeBusiness.isPublic !== false,
      operatingHours: normalizeOperatingHours(activeBusiness.operatingHours),
      paymentMethods: Array.isArray(activeBusiness.paymentMethods) ? activeBusiness.paymentMethods : []
    });
  }, [activeBusiness]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!activeBusiness?.id) return;
    try {
      const payload = {
        ...formData,
        queuePadLength: Number(formData.queuePadLength || 1),
        updatedAt: new Date().toISOString()
      };
      delete payload.queuePadLengthInput;
      await BusinessRepository.updateBusinessProfile(activeBusiness.id, payload);
      toast.success('Business settings saved successfully.');
    } catch (error) {
      console.error('Save business settings failed:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-card-gap pb-12">
      {/* Navigation Sidebar (Internal) */}
      <div className="col-span-12 lg:col-span-3">
        <SettingsNav />
      </div>

      {/* Configuration Form Area */}
      <div className="col-span-12 lg:col-span-9 space-y-card-gap">
        <BusinessProfile formData={formData} onChange={handleFieldChange} />
        <OperatingHours value={formData.operatingHours} onChange={(value) => handleFieldChange('operatingHours', value)} />
        <NotificationPreferences />

        {/* Save Banner */}
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
            <button className="flex-1 md:flex-none px-6 py-3 rounded-full border border-outline text-on-surface font-label-md hover:bg-surface-container-high transition-colors">Discard</button>
            <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Save & Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};
