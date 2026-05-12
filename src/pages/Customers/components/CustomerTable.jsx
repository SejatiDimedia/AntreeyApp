import React, { useMemo, useState } from 'react';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=E7EEF8&color=1E293B&size=128';

export const CustomerTable = ({ users = [], canManage = false, onRoleChange, onEdit, onDelete, onAssign, showMembership = false }) => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, safeCurrentPage]);
  const startIndex = users.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, users.length);

  if (!canManage) {
    return (
      <div className="glass-card rounded-[32px] p-8 border border-white/40">
        <p className="text-on-surface-variant">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[32px] overflow-hidden flex flex-col border border-white/40">
      <div className="bg-inverse-surface text-on-primary px-container-padding py-6 flex items-center justify-between">
        <h2 className="text-headline-lg-mobile font-headline-lg-mobile flex items-center gap-2">
          Database <span className="text-primary-container text-body-md font-body-md">{users.length} Records</span>
        </h2>
        <div className="flex gap-2">
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-label-sm flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-label-sm flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm border-b border-outline-variant/20">
              <th className="px-6 py-4 font-label-sm">Customer Details</th>
              <th className="px-6 py-4 font-label-sm">Contact Info</th>
              <th className="px-6 py-4 font-label-sm">Booking History</th>
              <th className="px-6 py-4 font-label-sm">Last Visit</th>
              <th className="px-6 py-4 font-label-sm">Status</th>
              {showMembership && <th className="px-6 py-4 font-label-sm">Membership</th>}
              <th className="px-6 py-4 font-label-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {paginatedUsers.map((customer) => (
              <tr key={customer.id} className={`hover:bg-primary-container/10 transition-colors group ${customer.rowBg || ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img alt="Customer" className="w-10 h-10 rounded-full bg-surface-container object-cover" src={customer.photoURL || defaultAvatar} />
                    <div>
                      <p className="font-label-md text-on-surface">{customer.name || '-'}</p>
                      <p className="text-[12px] text-on-surface-variant">ID: {customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-body-md text-on-surface">{customer.phone || '-'}</p>
                  <p className="text-[12px] text-on-surface-variant">{customer.email || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start">
                    <span className="font-body-md text-on-surface">{customer.bookings || 0} Bookings</span>
                    <span className="text-[12px] font-label-sm text-on-surface-variant">{customer.role || 'customer'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-body-md text-on-surface">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('id-ID') : '-'}</p>
                  <p className="text-[12px] text-on-surface-variant">Joined</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[12px] font-label-md bg-primary-container/40 text-on-primary-container">Active</span>
                </td>
                {showMembership && (
                  <td className="px-6 py-4">
                    {customer.isMemberOfActiveBusiness ? (
                      <span className="px-3 py-1 rounded-full text-[12px] font-label-md bg-primary-container/40 text-on-primary-container">Member</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[12px] font-label-md bg-error-container text-on-error-container">Not Member</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onEdit?.(customer)} className="text-on-surface-variant hover:bg-surface-container-highest p-2 rounded-full transition-all material-symbols-outlined">edit</button>
                  <button onClick={() => onDelete?.(customer.id)} className="text-error hover:bg-error-container p-2 rounded-full transition-all material-symbols-outlined">delete</button>
                  {showMembership && !customer.isMemberOfActiveBusiness && (
                    <button onClick={() => onAssign?.(customer.id)} className="ml-2 px-2 py-1 rounded-md bg-primary text-on-primary text-[12px]">Assign</button>
                  )}
                  <select
                    className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-2 py-1 text-[12px]"
                    value={customer.role || 'customer'}
                    onChange={(e) => onRoleChange?.(customer.id, e.target.value)}
                  >
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="customer">customer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container-low px-container-padding py-4 flex items-center justify-between border-t border-outline-variant/10">
        <p className="text-label-sm text-on-surface-variant">Showing {startIndex}-{endIndex} of {users.length} users</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg hover:bg-surface-container-highest/50 disabled:opacity-30" disabled={safeCurrentPage === 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let page = i + 1;
            if (safeCurrentPage > 2 && totalPages > 3) {
              page = Math.min(totalPages - 2 + i, totalPages);
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-label-sm ${safeCurrentPage === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest/50 text-on-surface'}`}
              >
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-lg hover:bg-surface-container-highest/50" disabled={safeCurrentPage === totalPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
