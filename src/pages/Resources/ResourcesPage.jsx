import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessRepository } from '../../repositories';

const initialForm = { name: '', type: 'custom', capacity: 1, status: 'active', basePrice: '' };

export const ResourcesPage = () => {
  const { activeBusiness } = useBusiness();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingResource, setEditingResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!activeBusiness?.id) return setResources([]);
      const data = await BusinessRepository.getResources(activeBusiness.id);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setResources(sorted);
    };
    load();
  }, [activeBusiness?.id]);

  const openCreate = () => {
    setEditingResource(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name || '',
      type: resource.type || 'custom',
      capacity: resource.capacity || 1,
      status: resource.status || 'active',
      basePrice: resource.basePrice || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeBusiness?.id || !formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      capacity: Number(formData.capacity || 1),
      status: formData.status,
      basePrice: formData.basePrice === '' ? null : Number(formData.basePrice),
      updatedAt: new Date().toISOString()
    };

    if (editingResource?.id) {
      const ok = window.confirm('Save changes to this resource?');
      if (!ok) return;
      await BusinessRepository.updateResource(activeBusiness.id, editingResource.id, payload);
    } else {
      await BusinessRepository.addResource(activeBusiness.id, { ...payload, createdAt: new Date().toISOString() });
    }

    const data = await BusinessRepository.getResources(activeBusiness.id);
    const sorted = [...data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setResources(sorted);
    setIsModalOpen(false);
  };

  const handleDelete = async (resourceId) => {
    if (!activeBusiness?.id) return;
    const ok = window.confirm('Delete this resource? This action cannot be undone.');
    if (!ok) return;
    await BusinessRepository.deleteResource(activeBusiness.id, resourceId);
    setResources((prev) => prev.filter((item) => item.id !== resourceId));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="glass-card rounded-[32px] overflow-hidden flex flex-col border border-white/40">
        <div className="bg-inverse-surface text-on-primary px-container-padding py-6 flex items-center justify-between">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile flex items-center gap-2">
            Resources <span className="text-primary-container text-body-md font-body-md">{resources.length} Records</span>
          </h2>
          <button onClick={openCreate} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-label-sm flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Resource
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-sm">Resource Name</th>
                <th className="px-6 py-4 font-label-sm">Type</th>
                <th className="px-6 py-4 font-label-sm">Capacity</th>
                <th className="px-6 py-4 font-label-sm">Status</th>
                <th className="px-6 py-4 font-label-sm">Base Price</th>
                <th className="px-6 py-4 font-label-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
            {resources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                  No resources yet. Click <span className="font-semibold">Add Resource</span> to create your first one.
                </td>
              </tr>
            )}
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-primary-container/10 transition-colors">
                <td className="px-6 py-4 font-medium">{resource.name}</td>
                <td className="px-6 py-4 capitalize">{resource.type}</td>
                <td className="px-6 py-4">{resource.capacity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    resource.status === 'active' ? 'bg-primary-container/40 text-on-primary-container' :
                    resource.status === 'maintenance' ? 'bg-tertiary-container/40 text-on-tertiary-container' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {resource.status}
                  </span>
                </td>
                <td className="px-6 py-4">{resource.basePrice ? `Rp ${Number(resource.basePrice).toLocaleString('id-ID')}` : '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(resource)} className="text-on-surface-variant hover:bg-surface-container-highest p-2 rounded-full transition-all material-symbols-outlined">edit</button>
                  <button onClick={() => handleDelete(resource.id)} className="text-error hover:bg-error-container p-2 rounded-full transition-all material-symbols-outlined">delete</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface-container-low px-container-padding py-4 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-label-sm text-on-surface-variant">Showing {resources.length} resources</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-container-highest/50 disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary text-label-sm">1</button>
            <button className="p-2 rounded-lg hover:bg-surface-container-highest/50 disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/65 backdrop-blur-[1px] z-[9999] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-surface rounded-3xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-headline-lg-mobile">{editingResource ? 'Edit Resource' : 'Add Resource'}</h3>
            <input className="bg-surface-container rounded-xl p-3" placeholder="Resource name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            <select className="bg-surface-container rounded-xl p-3" value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}>
              <option value="custom">custom</option>
              <option value="room">room</option>
              <option value="seat">seat</option>
              <option value="field">field</option>
              <option value="equipment">equipment</option>
            </select>
            <input className="bg-surface-container rounded-xl p-3" type="number" min="1" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))} />
            <select className="bg-surface-container rounded-xl p-3" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="maintenance">maintenance</option>
            </select>
            <input className="bg-surface-container rounded-xl p-3" type="number" min="0" placeholder="Base Price (optional)" value={formData.basePrice} onChange={(e) => setFormData((p) => ({ ...p, basePrice: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-surface-container">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary">Save</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};
