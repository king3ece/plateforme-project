import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Users, Building2, Building, Briefcase, GitBranch } from 'lucide-react';

const adminMenuItems = [
  { path: '/admin/users', label: 'Utilisateurs', icon: Users },

  { path: '/admin/subdivisions', label: 'Subdivisions', icon: Building2 },

  { path: '/admin/type-subdivisions', label: 'TypeSubdivision', icon: Building },

  { path: '/admin/postes', label: 'Postes', icon: Briefcase },

  { path: '/admin/workflows', label: 'Workflows', icon: GitBranch },
];

export const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
