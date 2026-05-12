import React from 'react';

export const StaffList = ({ staff = [], onEdit, onDelete }) => {
  return (
    <>
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile px-2">Your Team</h2>
      
      {staff.map((staffMember) => (
        <div 
          key={staffMember.id} 
          className={`glass-card p-container-padding rounded-3xl flex items-center gap-4 group hover:bg-primary/5 transition-all ${staffMember.status === 'Working' ? 'border-l-4 border-l-primary' : ''}`}
        >
          <img 
            alt={staffMember.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" 
            src={staffMember.img || 'https://ui-avatars.com/api/?name=Staff'} 
          />
          <div className="flex-grow">
            <h3 className="font-label-md text-label-md text-on-surface">{staffMember.name}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{staffMember.role}</p>
            <div className="flex items-center gap-1 mt-1 text-primary">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[12px] font-bold">{staffMember.rating || 0}</span>
            </div>
          </div>
          
          {staffMember.status === 'Working' ? (
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Working
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit?.(staffMember)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button onClick={() => onDelete?.(staffMember.id)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
