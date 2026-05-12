import React from 'react';

export const ServiceCard = ({ icon, title, description, duration, price, isHighlighted, iconBg, iconColor, onEdit, onDelete }) => {
  if (isHighlighted) {
    return (
      <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col justify-between min-h-[280px] bg-gradient-to-br from-primary-container/20 to-white/50 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl group-hover:bg-primary-container/50 transition-all duration-700"></div>
        <div className="z-10">
          <span className="bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">Top Performer</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface mt-4">{title}</h2>
          <p className="text-on-surface-variant text-body-md mt-2 max-w-sm">{description}</p>
        </div>
        <div className="z-10 flex items-center justify-between mt-6">
          <div className="flex flex-col">
            <span className="text-label-sm text-on-surface-variant uppercase font-bold">Base Price</span>
            <span className="font-headline-lg text-headline-lg text-primary">{price}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm hover:shadow transition-all"><span className="material-symbols-outlined">edit</span></button>
            <button onClick={onDelete} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-on-surface-variant hover:text-error shadow-sm hover:shadow transition-all"><span className="material-symbols-outlined">delete</span></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col transition-transform hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconBg || 'bg-surface-container-high'}`}>
        <span className={`material-symbols-outlined text-3xl ${iconColor || 'text-primary'}`}>{icon}</span>
      </div>
      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">{title}</h3>
      <p className="text-on-surface-variant text-body-md mb-8 flex-1">{description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
        <div>
          <p className="text-label-sm text-on-surface-variant font-bold">{duration}</p>
          <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{price}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded-lg transition-colors"><span className="material-symbols-outlined">edit</span></button>
          <button onClick={onDelete} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-error rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
        </div>
      </div>
    </div>
  );
};
