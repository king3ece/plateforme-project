import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FileText, CheckSquare, LayoutDashboard } from 'lucide-react';

const userMenuItems = [
  { path: '/user', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/user/demandes', label: 'Mes Demandes', icon: FileText },
  { path: '/user/validations', label: 'À Valider', icon: CheckSquare },
];

export const UserLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {userMenuItems.map((item) => {
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
