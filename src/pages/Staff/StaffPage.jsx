import React, { useEffect, useState } from 'react';
import { StaffList } from './components/StaffList';
import { StaffStats } from './components/StaffStats';
import { WeeklySchedule } from './components/WeeklySchedule';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository } from '../../repositories';

const initialForm = { name: '', role: '', rating: '', img: '' };

export const StaffPage = () => {
  const { activeBusiness } = useBusiness();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    const loadStaff = async () => {
      if (!activeBusiness?.id) {
        setStaff([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await BusinessRepository.getStaff(activeBusiness.id);
        setStaff(data);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [activeBusiness?.id]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      rating: String(member.rating || ''),
      img: member.img || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeBusiness?.id || !formData.name.trim() || !formData.role.trim()) return;

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      rating: Number(formData.rating || 0),
      img: formData.img.trim(),
      status: 'Available'
    };

    if (editingStaff?.id) {
      await BusinessRepository.updateStaff(activeBusiness.id, editingStaff.id, payload);
    } else {
      await BusinessRepository.addStaff(activeBusiness.id, payload);
    }

    const data = await BusinessRepository.getStaff(activeBusiness.id);
    setStaff(data);
    setIsModalOpen(false);
  };

  const handleDelete = async (staffId) => {
    if (!activeBusiness?.id) return;
    await BusinessRepository.deleteStaff(activeBusiness.id, staffId);
    setStaff((prev) => prev.filter((member) => member.id !== staffId));
  };

  return (
    <div className="pb-8 grid grid-cols-12 gap-card-gap">
      {/* Left Column: Staff List (Bento-style Cards) */}
      <section className="col-span-12 lg:col-span-4 flex flex-col gap-card-gap">
        {loading ? <p className="text-on-surface-variant px-2">Loading team...</p> : <StaffList staff={staff} onEdit={openEditModal} onDelete={handleDelete} />}
        <StaffStats />
      </section>

      {/* Right Column: Weekly Schedule */}
      <section className="col-span-12 lg:col-span-8">
        <WeeklySchedule />
      </section>

      {/* FAB for quick action */}
      <button onClick={openCreateModal} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">edit_calendar</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-4">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h3>
            <input className="bg-surface-container rounded-xl p-3" placeholder="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Role" value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Rating (0-5)" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Image URL (optional)" value={formData.img} onChange={(e) => setFormData((prev) => ({ ...prev, img: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
