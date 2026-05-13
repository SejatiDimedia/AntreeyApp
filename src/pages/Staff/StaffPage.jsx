import React, { useEffect, useState } from 'react';
import { StaffList } from './components/StaffList';
import { StaffStats } from './components/StaffStats';
import { WeeklySchedule } from './components/WeeklySchedule';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository, UserRepository } from '../../repositories';
import { BookingRepository } from '../../repositories/BookingRepository';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

const initialForm = {
  selectedUserId: '',
  rating: '',
  img: '',
  startTime: '09:00',
  endTime: '17:00',
  workingDays: [1, 2, 3, 4, 5, 6]
};
const WEEK_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export const StaffPage = () => {
  const { activeBusiness } = useBusiness();
  const [staff, setStaff] = useState([]);
  const [staffCandidates, setStaffCandidates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const weeklyEfficiency = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const weekKeys = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    });
    const weekSet = new Set(weekKeys);
    const activeBookings = bookings.filter((b) => weekSet.has(b.date) && b.status !== 'cancelled');

    const staffCapacity = staff.reduce((sum, member) => {
      const workDays = Array.isArray(member?.availability?.workingDays) ? member.availability.workingDays.length : 6;
      const startMin = (() => {
        const s = member?.availability?.startTime || '09:00';
        const [h, mm] = s.split(':').map(Number);
        return (h * 60) + mm;
      })();
      const endMin = (() => {
        const s = member?.availability?.endTime || '17:00';
        const [h, mm] = s.split(':').map(Number);
        return (h * 60) + mm;
      })();
      const dailySlots = Math.max(0, Math.floor((endMin - startMin) / 60) + 1);
      return sum + (dailySlots * workDays);
    }, 0);
    if (staffCapacity <= 0) return 0;
    return Math.min(100, Math.round((activeBookings.length / staffCapacity) * 100));
  }, [bookings, staff]);

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
        await Promise.all(
          data
            .filter((member) => member.userId)
            .map((member) => BusinessRepository.upsertBusinessMember(activeBusiness.id, member.userId, {
              roleInBusiness: 'staff',
              status: 'active',
              name: member.name || '',
              email: member.email || '',
              staffDocId: member.id
            }))
        );
        setStaff(data);
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [activeBusiness?.id]);

  useEffect(() => {
    if (!activeBusiness?.id) {
      setBookings([]);
      return;
    }
    // Reset immediately on business switch to avoid showing previous business metrics.
    setBookings([]);
    const unsubscribe = BookingRepository.subscribeToAllBookings(activeBusiness.id, setBookings);
    return () => unsubscribe();
  }, [activeBusiness?.id]);

  useEffect(() => {
    async function loadStaffCandidates() {
      if (!activeBusiness?.id) {
        setStaffCandidates([]);
        return;
      }
      try {
        const [users, membersSnap, customersSnap] = await Promise.all([
          UserRepository.getAllUsers(),
          getDocs(collection(db, `businesses/${activeBusiness.id}/members`)),
          getDocs(collection(db, `businesses/${activeBusiness.id}/customers`))
        ]);
        const members = membersSnap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        const customers = customersSnap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        const businessMemberIds = new Set(members.map((member) => member.id));
        const businessCustomerIds = new Set(customers.map((customer) => customer.id));
        const scopedIds = new Set([...businessMemberIds, ...businessCustomerIds]);
        const businessStaffIds = new Set(
          members
            .filter((member) => {
              const roleInBusiness = String(member.roleInBusiness || '').toLowerCase();
              const role = String(member.role || '').toLowerCase();
              return roleInBusiness === 'staff' || role === 'staff';
            })
            .map((member) => member.id)
        );
        customers.forEach((customer) => {
          const role = String(customer.roleInBusiness || customer.role || '').toLowerCase();
          if (role === 'staff') businessStaffIds.add(customer.id);
        });
        setStaffCandidates(
          users.filter((u) => {
            const userRole = String(u.role || '').toLowerCase();
            if (!scopedIds.has(u.id)) return false;
            // Primary: role staff in users + member of active business.
            // Fallback: explicit staff role in membership document.
            return userRole === 'staff' || businessStaffIds.has(u.id);
          })
        );
      } catch (error) {
        console.error('Failed loading staff candidates:', error);
        setStaffCandidates([]);
      }
    }
    loadStaffCandidates();
  }, [activeBusiness?.id]);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      selectedUserId: member.userId || '',
      rating: String(member.rating || ''),
      img: member.img || '',
      startTime: member?.availability?.startTime || '09:00',
      endTime: member?.availability?.endTime || '17:00',
      workingDays: Array.isArray(member?.availability?.workingDays) ? member.availability.workingDays : [1, 2, 3, 4, 5, 6]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeBusiness?.id) return;

    const selectedUser = staffCandidates.find((u) => u.id === formData.selectedUserId);
    if (!editingStaff?.id && !selectedUser) return;
    if (!editingStaff?.id && selectedUser) {
      const alreadyExists = staff.some((member) => (member.userId || member.id) === selectedUser.id);
      if (alreadyExists) {
        toast.error('This staff member is already assigned to this business.');
        return;
      }
    }

    const payload = {
      name: editingStaff?.name || selectedUser?.name || selectedUser?.email || 'Staff',
      role: editingStaff?.role || 'Staff',
      userId: editingStaff?.userId || selectedUser?.id || '',
      rating: Number(formData.rating || 0),
      img: (formData.img || editingStaff?.img || selectedUser?.photoURL || '').trim(),
      status: 'Available',
      availability: {
        startTime: formData.startTime,
        endTime: formData.endTime,
        workingDays: Array.isArray(formData.workingDays) ? formData.workingDays : [1, 2, 3, 4, 5, 6]
      }
    };

    if (editingStaff?.id) {
      await BusinessRepository.updateStaff(activeBusiness.id, editingStaff.id, payload);
      if (payload.userId) {
        await BusinessRepository.upsertBusinessMember(activeBusiness.id, payload.userId, {
          roleInBusiness: 'staff',
          status: 'active',
          name: payload.name,
          email: selectedUser?.email || editingStaff?.email || '',
          staffDocId: editingStaff.id
        });
      }
    } else {
      const createdStaff = await BusinessRepository.addStaff(activeBusiness.id, payload);
      await BusinessRepository.upsertBusinessMember(activeBusiness.id, payload.userId, {
        roleInBusiness: 'staff',
        status: 'active',
        name: payload.name,
        email: selectedUser?.email || '',
        staffDocId: createdStaff.id
      });
    }

    const data = await BusinessRepository.getStaff(activeBusiness.id);
    setStaff(data);
    setIsModalOpen(false);
  };
  const availableCandidates = staffCandidates.filter((user) => !staff.some((member) => (member.userId || member.id) === user.id));

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
        <StaffStats efficiency={weeklyEfficiency} deltaLabel="Live" />
      </section>

      {/* Right Column: Weekly Schedule */}
      <section className="col-span-12 lg:col-span-8">
        <WeeklySchedule staff={staff} bookings={bookings} />
      </section>

      {/* FAB for quick action */}
      <button onClick={openCreateModal} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">edit_calendar</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-4">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h3>
            {!editingStaff ? (
              <>
                <select className="bg-surface-container rounded-xl p-3" value={formData.selectedUserId} onChange={(e) => setFormData((prev) => ({ ...prev, selectedUserId: e.target.value }))} required>
                  <option value="">Select staff user</option>
                  {availableCandidates.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.email})
                    </option>
                  ))}
                </select>
                {availableCandidates.length === 0 && (
                  <p className="text-xs text-on-surface-variant">
                    All staff users for the active business have already been added.
                  </p>
                )}
              </>
            ) : (
              <div className="bg-surface-container rounded-xl p-3 text-sm text-on-surface-variant">
                Staff: <span className="text-on-surface font-semibold">{editingStaff.name || '-'}</span>
              </div>
            )}
            <input className="bg-surface-container rounded-xl p-3" placeholder="Rating (0-5)" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Image URL (optional)" value={formData.img} onChange={(e) => setFormData((prev) => ({ ...prev, img: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-on-surface-variant">
                Start Time
                <input className="mt-1 w-full bg-surface-container rounded-xl p-3" type="time" value={formData.startTime} onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))} />
              </label>
              <label className="text-sm text-on-surface-variant">
                End Time
                <input className="mt-1 w-full bg-surface-container rounded-xl p-3" type="time" value={formData.endTime} onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))} />
              </label>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-2">Working Days</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => {
                  const active = formData.workingDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        workingDays: active
                          ? prev.workingDays.filter((v) => v !== day.value)
                          : [...prev.workingDays, day.value].sort((a, b) => a - b)
                      }))}
                      className={`px-3 py-1.5 rounded-full text-xs border ${active ? 'bg-primary text-white border-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
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
