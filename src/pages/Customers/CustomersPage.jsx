import React, { useEffect, useState } from 'react';
import { CustomerStats } from './components/CustomerStats';
import { CustomerTable } from './components/CustomerTable';
import { CustomerPreview } from './components/CustomerPreview';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { UserRepository } from '../../repositories';
import { firebaseConfig } from '../../config/firebase';

export const CustomersPage = () => {
  const { role, currentUser } = useAuth();
  const { activeBusiness, businesses } = useBusiness();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'customer', photoURL: '', password: '' });
  const [assignToActiveBusiness, setAssignToActiveBusiness] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [allUsersForAssign, setAllUsersForAssign] = useState([]);
  const [selectedAssignUserId, setSelectedAssignUserId] = useState('');
  const [selectedAssignBusinessId, setSelectedAssignBusinessId] = useState('');
  const [editingMembershipBusinessIds, setEditingMembershipBusinessIds] = useState([]);

  const canManage = role === 'admin' || role === 'owner';

  useEffect(() => {
    async function loadUsers() {
      if (!canManage) return;
      let data = [];
      if (role === 'admin') {
        data = await UserRepository.getAllUsers();
      } else if (role === 'owner') {
        if (!activeBusiness?.id) {
          setUsers([]);
          return;
        }
        const [allUsers, membershipMap] = await Promise.all([
          UserRepository.getAllUsers(),
          UserRepository.getCustomerMembershipMap(activeBusiness.id)
        ]);
        data = allUsers.map((user) => ({
          ...user,
          isMemberOfActiveBusiness: membershipMap.has(user.id)
        }));
        data = data.filter((user) => user.isMemberOfActiveBusiness);
      }
      setUsers(data);
    }
    loadUsers();
  }, [canManage, role, activeBusiness?.id]);

  const handleRoleChange = async (userId, nextRole) => {
    await UserRepository.updateUserRole(userId, nextRole);
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', role: 'customer', photoURL: '', password: '' });
    setAssignToActiveBusiness(true);
    setSelectedBusinessId(activeBusiness?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = async (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      photoURL: user.photoURL || '',
      password: ''
    });
    if (role === 'owner') {
      const ownerBusinessIds = (businesses || []).map((business) => business.id);
      const membershipBusinessIds = await UserRepository.getCustomerBusinessMemberships(user.id, ownerBusinessIds);
      setEditingMembershipBusinessIds(membershipBusinessIds);
    } else {
      setEditingMembershipBusinessIds([]);
    }
    setIsModalOpen(true);
  };

  const openAssignModal = async () => {
    if (role !== 'owner') return;
    const ownerBusinessIds = (businesses || []).map((business) => business.id);
    const ownerCustomers = await UserRepository.getCustomersByBusinessIds(ownerBusinessIds);
    setAllUsersForAssign(ownerCustomers.filter((u) => (u.role || 'customer') === 'customer'));
    setSelectedAssignUserId('');
    setSelectedAssignBusinessId(activeBusiness?.id || businesses?.[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canManage || !formData.name.trim() || !formData.email.trim()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      photoURL: formData.photoURL.trim()
    };

    if (editingUser?.id) {
      await UserRepository.updateUserProfile(editingUser.id, payload);
      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...payload } : user)));
    } else {
      if (!formData.password || formData.password.length < 6) return;
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
      const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          returnSecureToken: true
        })
      });
      const authData = await authRes.json();
      if (!authRes.ok || !authData.localId) {
        throw new Error(authData?.error?.message || 'Failed creating auth user');
      }

      const userId = authData.localId;
      await UserRepository.saveUserProfile(userId, payload);
      const targetBusinessId = selectedBusinessId || activeBusiness?.id;
      if (role === 'owner' && targetBusinessId && assignToActiveBusiness) {
        await UserRepository.assignCustomerToBusiness(targetBusinessId, userId, currentUser?.uid);
      }
      setUsers((prev) => [{
        id: userId,
        ...payload,
        isMemberOfActiveBusiness: role === 'owner' && activeBusiness?.id && (selectedBusinessId || activeBusiness?.id) === activeBusiness.id ? assignToActiveBusiness : undefined
      }, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (userId) => {
    if (!canManage) return;
    await UserRepository.deleteUser(userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleAssignToActiveBusiness = async (userId) => {
    if (role !== 'owner' || !activeBusiness?.id) return;
    await UserRepository.assignCustomerToBusiness(activeBusiness.id, userId, currentUser?.uid);
    setUsers((prev) => prev.map((user) => (
      user.id === userId ? { ...user, isMemberOfActiveBusiness: true } : user
    )));
  };

  const handleAssignExistingCustomer = async (e) => {
    e.preventDefault();
    if (!selectedAssignUserId || !selectedAssignBusinessId) return;
    await UserRepository.assignCustomerToBusiness(selectedAssignBusinessId, selectedAssignUserId, currentUser?.uid);
    setIsAssignModalOpen(false);
    if (selectedAssignBusinessId === activeBusiness?.id) {
      const assignedUser = allUsersForAssign.find((u) => u.id === selectedAssignUserId);
      if (assignedUser) {
        setUsers((prev) => prev.some((u) => u.id === assignedUser.id) ? prev : [{ ...assignedUser, isMemberOfActiveBusiness: true }, ...prev]);
      }
    }
  };

  const handleRevokeCustomerBusiness = async (businessId) => {
    if (!editingUser?.id) return;
    await UserRepository.removeCustomerFromBusiness(businessId, editingUser.id);
    setEditingMembershipBusinessIds((prev) => prev.filter((id) => id !== businessId));
    if (businessId === activeBusiness?.id) {
      setUsers((prev) => prev.filter((user) => user.id !== editingUser.id));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-card-gap pb-8 relative z-10">
        <CustomerStats users={users} onAddCustomer={openCreateModal} onAssignExistingCustomer={openAssignModal} />
        <CustomerTable users={users} canManage={canManage} onRoleChange={handleRoleChange} onEdit={openEditModal} onDelete={handleDelete} onAssign={handleAssignToActiveBusiness} showMembership={role === 'owner'} />
        <CustomerPreview />
      </div>

      {/* FAB for quick action */}
      <button onClick={openCreateModal} className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-[32px]">person_add</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">{editingUser ? 'Edit Customer' : 'Add Customer'}</h3>
            <input className="bg-surface-container rounded-xl p-3" placeholder="Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
            <input className="bg-surface-container rounded-xl p-3" placeholder="Photo URL (optional)" value={formData.photoURL} onChange={(e) => setFormData((prev) => ({ ...prev, photoURL: e.target.value }))} />
            {!editingUser && (
              <input className="bg-surface-container rounded-xl p-3" placeholder="Password (min 6 chars)" type="password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} />
            )}
            {!editingUser && role === 'owner' && activeBusiness?.id && (
              <label className="flex items-center gap-2 text-sm text-on-surface-variant px-1">
                <input
                  type="checkbox"
                  checked={assignToActiveBusiness}
                  onChange={(e) => setAssignToActiveBusiness(e.target.checked)}
                />
                Add as customer member of active business
              </label>
            )}
            {!editingUser && role === 'owner' && businesses?.length > 0 && assignToActiveBusiness && (
              <select
                className="bg-surface-container rounded-xl p-3"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name || business.businessName || `Business ${business.id.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            )}
            {editingUser && role === 'owner' && (
              <div className="bg-surface-container rounded-xl p-3">
                <p className="text-sm text-on-surface-variant mb-2">Business Memberships</p>
                <div className="flex flex-wrap gap-2">
                  {editingMembershipBusinessIds.length === 0 && (
                    <span className="text-xs text-on-surface-variant">Not assigned to any of your businesses.</span>
                  )}
                  {editingMembershipBusinessIds.map((businessId) => {
                    const business = businesses.find((item) => item.id === businessId);
                    return (
                      <span key={businessId} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 text-on-primary-container text-xs">
                        {business?.name || business?.businessName || businessId}
                        <button type="button" onClick={() => handleRevokeCustomerBusiness(businessId)} className="text-error">x</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <select className="bg-surface-container rounded-xl p-3" value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}>
              <option value="customer">customer</option>
              <option value="staff">staff</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <form onSubmit={handleAssignExistingCustomer} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">Assign Existing Customer</h3>
            <select className="bg-surface-container rounded-xl p-3" value={selectedAssignUserId} onChange={(e) => setSelectedAssignUserId(e.target.value)} required>
              <option value="">Select customer</option>
              {allUsersForAssign.map((user) => (
                <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
              ))}
            </select>
            <select className="bg-surface-container rounded-xl p-3" value={selectedAssignBusinessId} onChange={(e) => setSelectedAssignBusinessId(e.target.value)} required>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>{business.name || business.businessName || business.id}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary">Assign</button>
            </div>
          </form>
        </div>
      )}

      {/* Visual Background Accents (Glassmorphism Context) */}
      <div className="fixed -bottom-20 -left-20 w-[400px] h-[400px] bg-primary-fixed/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed top-20 -right-20 w-[300px] h-[300px] bg-tertiary-fixed/20 blur-[80px] rounded-full -z-10 pointer-events-none"></div>
    </>
  );
};
