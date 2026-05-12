import React, { useEffect, useMemo, useState } from 'react';
import { ServiceCard } from './components/ServiceCard';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository } from '../../repositories';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const initialForm = {
  title: '',
  description: '',
  durationMinutes: '',
  price: '',
  requiredResourceType: 'none',
  resourceIds: [],
  icon: 'inventory_2',
  scheduleMode: 'range', // range | custom
  availableStartTime: '09:00',
  availableEndTime: '17:00',
  slotIntervalMinutes: '60',
  availableTimeSlotsText: ''
};

export const ServicesPage = () => {
  const { activeBusiness } = useBusiness();
  const [services, setServices] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookingCountByService, setBookingCountByService] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      if (!activeBusiness?.id) {
        setServices([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [servicesData, resourcesData] = await Promise.all([
          BusinessRepository.getServices(activeBusiness.id),
          BusinessRepository.getResources(activeBusiness.id)
        ]);
        setServices(servicesData);
        setResources(resourcesData);

        const bookingsSnapshot = await getDocs(collection(db, `businesses/${activeBusiness.id}/bookings`));
        const countMap = {};
        bookingsSnapshot.forEach((item) => {
          const data = item.data();
          const serviceId = data.serviceId;
          if (!serviceId) return;
          countMap[serviceId] = (countMap[serviceId] || 0) + 1;
        });
        setBookingCountByService(countMap);
      } catch (err) {
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [activeBusiness?.id]);

  const mappedServices = useMemo(() => services.map((service, index) => ({
    ...service,
    isHighlighted: index === 0,
    icon: (!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon,
    rawPrice: service.price,
    duration: `${service.durationMinutes || 30} MIN`,
    price: `Rp ${Number(service.price || 0).toLocaleString('id-ID')}`
  })), [services]);

  const distribution = useMemo(() => {
    return services
      .map((service) => ({
        serviceId: service.id,
        title: service.title || 'Untitled Service',
        count: Number(bookingCountByService[service.id] || 0)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [services, bookingCountByService]);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      durationMinutes: String(service.durationMinutes || ''),
      price: String(service.rawPrice ?? service.price ?? ''),
      requiredResourceType: service.requiredResourceType || 'none',
      resourceIds: service.resourceIds || [],
      icon: (!service.icon || service.icon === 'content_cut') ? 'inventory_2' : service.icon,
      scheduleMode: Array.isArray(service.availableTimeSlots) && service.availableTimeSlots.length > 0 ? 'custom' : 'range',
      availableStartTime: service.availableStartTime || '09:00',
      availableEndTime: service.availableEndTime || '17:00',
      slotIntervalMinutes: String(service.slotIntervalMinutes || service.durationMinutes || 60),
      availableTimeSlotsText: Array.isArray(service.availableTimeSlots) ? service.availableTimeSlots.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeBusiness?.id) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      durationMinutes: Number(formData.durationMinutes || 0),
      price: Number(formData.price || 0),
      icon: formData.icon || 'inventory_2',
      requiredResourceType: formData.requiredResourceType,
      resourceIds: formData.requiredResourceType === 'none' ? [] : formData.resourceIds
    };

    if (formData.scheduleMode === 'custom') {
      const slots = formData.availableTimeSlotsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      payload.availableTimeSlots = slots;
      payload.availableStartTime = '';
      payload.availableEndTime = '';
      payload.slotIntervalMinutes = 0;
    } else {
      payload.availableStartTime = formData.availableStartTime || '09:00';
      payload.availableEndTime = formData.availableEndTime || '17:00';
      payload.slotIntervalMinutes = Number(formData.slotIntervalMinutes || payload.durationMinutes || 60);
      payload.availableTimeSlots = [];
    }

    if (!payload.title || payload.durationMinutes <= 0 || payload.price <= 0) return;

    try {
      if (editingService?.id) {
        await BusinessRepository.updateService(activeBusiness.id, editingService.id, payload);
      } else {
        await BusinessRepository.addService(activeBusiness.id, payload);
      }
      const data = await BusinessRepository.getServices(activeBusiness.id);
      setServices(data);
      setIsModalOpen(false);
    } catch {
      setError('Failed to save service.');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!activeBusiness?.id) return;
    try {
      await BusinessRepository.deleteService(activeBusiness.id, serviceId);
      setServices((prev) => prev.filter((item) => item.id !== serviceId));
    } catch {
      setError('Failed to delete service.');
    }
  };

  return (
    <>
      {/* Bento Grid Layout for Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {loading && <p className="text-on-surface-variant">Loading services...</p>}
        {error && <p className="text-error">{error}</p>}
        {!loading && mappedServices.map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
            onEdit={() => openEditModal(service)}
            onDelete={() => handleDelete(service.id)}
          />
        ))}
        
        {/* Add New Placeholder */}
        <div onClick={openCreateModal} className="border-2 border-dashed border-outline-variant rounded-3xl p-6 flex flex-col items-center justify-center text-on-surface-variant/40 group hover:border-primary/40 hover:text-primary/60 cursor-pointer transition-all min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl">add</span>
          </div>
          <p className="font-headline-lg-mobile text-headline-lg-mobile">New Service</p>
          <p className="text-label-sm text-center px-6 mt-2">Expand your business by adding more options</p>
        </div>
      </div>
      
      <AnalyticsOverview
        averagePrice={services.length ? services.reduce((sum, item) => sum + Number(item.price || 0), 0) / services.length : 0}
        averageDuration={services.length ? services.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0) / services.length : 0}
        totalCategories={new Set(services.map((item) => item.requiredResourceType || 'none')).size}
        totalBookings={Object.values(bookingCountByService).reduce((sum, count) => sum + count, 0)}
        distribution={distribution}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-4">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">{editingService ? 'Edit Service' : 'Add Service'}</h3>
            <input className="bg-surface-container rounded-xl p-3" placeholder="Title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} />
            <textarea className="bg-surface-container rounded-xl p-3" placeholder="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Duration (minutes)" type="number" min="1" value={formData.durationMinutes} onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Price (IDR)" type="number" min="1" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} />
            <select className="bg-surface-container rounded-xl p-3" value={formData.icon} onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}>
              <option value="inventory_2">inventory_2</option>
              <option value="build">build</option>
              <option value="sports_tennis">sports_tennis</option>
              <option value="fitness_center">fitness_center</option>
              <option value="medical_services">medical_services</option>
              <option value="event_available">event_available</option>
              <option value="design_services">design_services</option>
              <option value="support_agent">support_agent</option>
            </select>
            <select className="bg-surface-container rounded-xl p-3" value={formData.requiredResourceType} onChange={(e) => setFormData((prev) => ({ ...prev, requiredResourceType: e.target.value }))}>
              <option value="none">No resource required</option>
              <option value="room">room</option>
              <option value="seat">seat</option>
              <option value="field">field</option>
              <option value="equipment">equipment</option>
              <option value="custom">custom</option>
            </select>
            <div className="bg-surface-container rounded-xl p-3 space-y-3">
              <p className="text-sm text-on-surface-variant">Available Time Settings</p>
              <select
                className="bg-surface rounded-xl p-3 w-full"
                value={formData.scheduleMode}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduleMode: e.target.value }))}
              >
                <option value="range">Range (auto generate slots)</option>
                <option value="custom">Custom slots (manual)</option>
              </select>
              {formData.scheduleMode === 'range' ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-surface rounded-xl p-3"
                    type="time"
                    value={formData.availableStartTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, availableStartTime: e.target.value }))}
                  />
                  <input
                    className="bg-surface rounded-xl p-3"
                    type="time"
                    value={formData.availableEndTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, availableEndTime: e.target.value }))}
                  />
                  <input
                    className="bg-surface rounded-xl p-3 col-span-2"
                    type="number"
                    min="5"
                    placeholder="Slot interval minutes (ex: 30)"
                    value={formData.slotIntervalMinutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slotIntervalMinutes: e.target.value }))}
                  />
                </div>
              ) : (
                <textarea
                  className="bg-surface rounded-xl p-3 w-full"
                  rows={3}
                  placeholder="Custom slots comma separated. Example: 09:00, 09:30, 10:30, 13:00"
                  value={formData.availableTimeSlotsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availableTimeSlotsText: e.target.value }))}
                />
              )}
            </div>
            {formData.requiredResourceType !== 'none' && (
              <div className="bg-surface-container rounded-xl p-3 space-y-2">
                <p className="text-sm text-on-surface-variant">Assign resources to this service</p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {resources
                    .filter((resource) => formData.requiredResourceType === 'custom' || resource.type === formData.requiredResourceType)
                    .map((resource) => (
                      <label key={resource.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.resourceIds.includes(resource.id)}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              resourceIds: e.target.checked
                                ? [...prev.resourceIds, resource.id]
                                : prev.resourceIds.filter((id) => id !== resource.id)
                            }));
                          }}
                        />
                        <span>{resource.name} ({resource.type})</span>
                      </label>
                    ))}
                  {resources.filter((resource) => formData.requiredResourceType === 'custom' || resource.type === formData.requiredResourceType).length === 0 && (
                    <p className="text-xs text-on-surface-variant">No matching resources. Add resources first from Resources menu.</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
