import React from 'react';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';

export const MainLayout = ({ children, title = 'Dashboard', activeCount }) => {
  return (
    <div className="min-h-screen flex bg-surface-bright font-body-md text-on-surface">
      <Sidebar />
      <div className="ml-[80px] flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopAppBar title={title} activeCount={activeCount} />
        <main className="flex-1 p-gutter w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
