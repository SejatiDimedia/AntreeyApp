import React from 'react';

export const StaffStats = ({ efficiency = 0, deltaLabel = '0.0%' }) => {
  const safeValue = Math.max(0, Math.min(100, Number(efficiency || 0)));
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-[40px] p-container-padding mt-4 relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="font-label-md text-label-md opacity-70">Weekly Staff Efficiency</h4>
        <div className="text-headline-lg font-bold mt-2">{safeValue}%</div>
        <p className="text-[12px] mt-1 opacity-50">{deltaLabel} from last week</p>
        
        <div className="w-full bg-on-surface-variant/20 h-1.5 rounded-full mt-4">
          <div className="bg-primary-fixed h-full rounded-full" style={{ width: `${safeValue}%` }}></div>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container/20 rounded-full blur-2xl"></div>
    </div>
  );
};
