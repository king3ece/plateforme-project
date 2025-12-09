import React from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'ADMIN' | 'USER';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <DashboardHeader />

        {/* Content */}
        <main className="pt-16">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};